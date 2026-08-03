const fs = require('fs');
const path = require('path');
const { getDb } = require('../config/database');
const { UPLOAD_ROOT } = require('../config/upload');
const { canAccessGroup, canAccessStudent } = require('../utils/access');

const VALID_STATES = new Set(['presente', 'ausente', 'retardo']);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

async function listGroupAttendance(req, res) {
  try {
    const groupId = Number(req.query.group_id);
    if (!groupId) return res.status(400).json({ message: 'group_id es obligatorio.' });
    const db = await getDb();
    if (!(await canAccessGroup(db, req.user, groupId))) {
      return res.status(403).json({ message: 'No tienes acceso a este grupo.' });
    }
    const from = req.query.fecha_desde || req.query.fecha || new Date().toISOString().slice(0, 10);
    const to = req.query.fecha_hasta || req.query.fecha || from;
    if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
      return res.status(400).json({ message: 'Las fechas deben usar YYYY-MM-DD.' });
    }
    const students = await db.all(
      `SELECT s.id AS student_id, s.matricula, u.nombre AS alumno
       FROM enrollments e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN users u ON u.id = s.user_id
       WHERE e.group_id = ? AND s.is_active = 1 ORDER BY u.nombre`,
      [groupId]
    );
    const records = await db.all(
      `SELECT ar.id, ar.student_id, ar.fecha, ar.estado,
              aj.id AS justification_id, aj.estado AS justification_status
       FROM attendance_records ar
       LEFT JOIN attendance_justifications aj ON aj.attendance_id = ar.id
       WHERE ar.group_id = ? AND ar.fecha BETWEEN ? AND ?
       ORDER BY ar.fecha`,
      [groupId, from, to]
    );
    return res.json({
      group_id: groupId,
      fecha_desde: from,
      fecha_hasta: to,
      rows: students.map((student) => ({
        id: student.student_id,
        ...student,
        attendance: Object.fromEntries(
          records
            .filter((record) => record.student_id === student.student_id)
            .map((record) => [record.fecha, record])
        ),
      })),
    });
  } catch (error) {
    console.error('listGroupAttendance:', error);
    return res.status(500).json({ message: 'Error al consultar asistencia.' });
  }
}

async function saveGroupAttendance(req, res) {
  const db = await getDb();
  let inTransaction = false;
  try {
    const groupId = Number(req.params.groupId);
    if (!(await canAccessGroup(db, req.user, groupId, { write: true }))) {
      return res.status(403).json({ message: 'No puedes registrar asistencia en este grupo.' });
    }
    const date = String(req.body.fecha || '');
    const records = Array.isArray(req.body.records) ? req.body.records : [];
    if (!DATE_PATTERN.test(date) || !records.length) {
      return res.status(400).json({ message: 'Envía fecha YYYY-MM-DD y al menos un registro.' });
    }
    await db.exec('BEGIN IMMEDIATE');
    inTransaction = true;
    for (const record of records) {
      const studentId = Number(record.student_id);
      const state = String(record.estado || '').toLowerCase();
      if (!studentId || !VALID_STATES.has(state)) {
        const error = new Error('Cada registro requiere alumno y estado válido.');
        error.status = 400;
        throw error;
      }
      const enrolled = await db.get(
        'SELECT id FROM enrollments WHERE group_id = ? AND student_id = ?',
        [groupId, studentId]
      );
      if (!enrolled) {
        const error = new Error('Uno de los alumnos no pertenece al grupo.');
        error.status = 400;
        throw error;
      }
      await db.run(
        `INSERT INTO attendance_records
          (group_id, student_id, fecha, estado, recorded_by_user_id)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(group_id, student_id, fecha) DO UPDATE SET
           estado = excluded.estado,
           recorded_by_user_id = excluded.recorded_by_user_id,
           updated_at = datetime('now')`,
        [groupId, studentId, date, state, req.user.id]
      );
    }
    await db.exec('COMMIT');
    inTransaction = false;
    return res.json({ message: 'Asistencia guardada correctamente.', saved: records.length });
  } catch (error) {
    if (inTransaction) await db.exec('ROLLBACK');
    if (error.status === 400) return res.status(400).json({ message: error.message });
    console.error('saveGroupAttendance:', error);
    return res.status(500).json({ message: 'Error al guardar asistencia.' });
  }
}

async function listStudentAttendance(req, res) {
  try {
    const studentId = Number(req.params.studentId);
    const db = await getDb();
    if (!(await canAccessStudent(db, req.user, studentId))) {
      return res.status(403).json({ message: 'No tienes acceso a la asistencia de este alumno.' });
    }
    const rows = await db.all(
      `SELECT ar.id, ar.fecha, ar.estado, g.id AS group_id,
              sub.nombre AS subject, c.nombre AS course,
              aj.id AS justification_id, aj.estado AS justification_status,
              aj.motivo AS justification_reason
       FROM attendance_records ar
       INNER JOIN groups g ON g.id = ar.group_id
       INNER JOIN subjects sub ON sub.id = g.subject_id
       INNER JOIN courses c ON c.id = g.course_id
       LEFT JOIN attendance_justifications aj ON aj.attendance_id = ar.id
       WHERE ar.student_id = ?
         AND (? IS NULL OR ar.fecha >= ?)
         AND (? IS NULL OR ar.fecha <= ?)
       ORDER BY ar.fecha DESC`,
      [
        studentId,
        req.query.fecha_desde || null,
        req.query.fecha_desde || null,
        req.query.fecha_hasta || null,
        req.query.fecha_hasta || null,
      ]
    );
    return res.json({ student_id: studentId, attendance: rows });
  } catch (error) {
    console.error('listStudentAttendance:', error);
    return res.status(500).json({ message: 'Error al consultar asistencia.' });
  }
}

function removeUploadedFile(file) {
  if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
}

async function submitJustification(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Adjunta un documento PDF, JPG o PNG.' });
    const attendanceId = Number(req.params.id);
    const motivo = String(req.body.motivo || '').trim();
    if (!motivo) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: 'El motivo es obligatorio.' });
    }
    const db = await getDb();
    const attendance = await db.get(
      'SELECT id, student_id, estado FROM attendance_records WHERE id = ?',
      [attendanceId]
    );
    if (!attendance) {
      removeUploadedFile(req.file);
      return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
    }
    if (!(await canAccessStudent(db, req.user, attendance.student_id))) {
      removeUploadedFile(req.file);
      return res.status(403).json({ message: 'No puedes justificar esta inasistencia.' });
    }
    if (attendance.estado !== 'ausente') {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: 'Sólo se pueden justificar registros ausentes.' });
    }
    const relativePath = path.relative(UPLOAD_ROOT, req.file.path).replaceAll('\\', '/');
    const result = await db.run(
      `INSERT INTO attendance_justifications
        (attendance_id, motivo, document_path, original_name, mime_type, submitted_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [attendanceId, motivo, relativePath, req.file.originalname, req.file.mimetype, req.user.id]
    );
    return res.status(201).json({
      message: 'Justificación enviada para revisión.',
      justification: { id: result.lastID, attendance_id: attendanceId, estado: 'pendiente' },
    });
  } catch (error) {
    removeUploadedFile(req.file);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'Esta inasistencia ya tiene una justificación.' });
    }
    console.error('submitJustification:', error);
    return res.status(500).json({ message: 'Error al guardar la justificación.' });
  }
}

async function reviewJustification(req, res) {
  try {
    const status = String(req.body.estado || '').toLowerCase();
    if (!['aprobada', 'rechazada'].includes(status)) {
      return res.status(400).json({ message: 'El estado debe ser aprobada o rechazada.' });
    }
    const db = await getDb();
    const justification = await db.get(
      `SELECT aj.id, ar.group_id
       FROM attendance_justifications aj
       INNER JOIN attendance_records ar ON ar.id = aj.attendance_id
       WHERE aj.id = ?`,
      [req.params.id]
    );
    if (!justification) return res.status(404).json({ message: 'Justificación no encontrada.' });
    if (!(await canAccessGroup(db, req.user, justification.group_id, { write: true }))) {
      return res.status(403).json({ message: 'No puedes revisar esta justificación.' });
    }
    await db.run(
      `UPDATE attendance_justifications
       SET estado = ?, reviewed_by_user_id = ?, reviewed_at = datetime('now')
       WHERE id = ?`,
      [status, req.user.id, justification.id]
    );
    return res.json({ message: 'Justificación revisada.', estado: status });
  } catch (error) {
    console.error('reviewJustification:', error);
    return res.status(500).json({ message: 'Error al revisar la justificación.' });
  }
}

async function downloadJustification(req, res) {
  try {
    const db = await getDb();
    const justification = await db.get(
      `SELECT aj.*, ar.student_id
       FROM attendance_justifications aj
       INNER JOIN attendance_records ar ON ar.id = aj.attendance_id
       WHERE aj.id = ?`,
      [req.params.id]
    );
    if (!justification) return res.status(404).json({ message: 'Justificación no encontrada.' });
    if (!(await canAccessStudent(db, req.user, justification.student_id))) {
      return res.status(403).json({ message: 'No tienes acceso a este documento.' });
    }
    const absolute = path.resolve(UPLOAD_ROOT, justification.document_path);
    if (!absolute.startsWith(path.resolve(UPLOAD_ROOT)) || !fs.existsSync(absolute)) {
      return res.status(404).json({ message: 'Documento no encontrado.' });
    }
    return res.download(absolute, justification.original_name);
  } catch (error) {
    console.error('downloadJustification:', error);
    return res.status(500).json({ message: 'Error al descargar el documento.' });
  }
}

module.exports = {
  listGroupAttendance,
  saveGroupAttendance,
  listStudentAttendance,
  submitJustification,
  reviewJustification,
  downloadJustification,
};
