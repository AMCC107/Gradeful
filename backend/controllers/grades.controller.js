const { getDb } = require('../config/database');
const { canAccessGroup, canAccessStudent } = require('../utils/access');

async function resolveCycleId(db, requestedCycleId, groupId = null) {
  if (requestedCycleId) return Number(requestedCycleId);
  if (groupId) {
    const group = await db.get('SELECT school_cycle_id FROM groups WHERE id = ?', [groupId]);
    if (group?.school_cycle_id) return group.school_cycle_id;
  }
  const active = await db.get(
    'SELECT id FROM school_cycles WHERE is_active = 1 ORDER BY fecha_inicio DESC LIMIT 1'
  );
  return active?.id ?? null;
}

async function listGroupGrades(req, res) {
  try {
    const groupId = Number(req.query.group_id);
    if (!groupId) {
      return res.status(400).json({ message: 'group_id es obligatorio.' });
    }
    const db = await getDb();
    if (!(await canAccessGroup(db, req.user, groupId))) {
      return res.status(403).json({ message: 'No tienes acceso a este grupo.' });
    }
    const cycleId = await resolveCycleId(db, req.query.school_cycle_id, groupId);
    const periods = cycleId
      ? await db.all(
          `SELECT id, nombre, numero, ponderacion FROM academic_periods
           WHERE school_cycle_id = ? ORDER BY numero`,
          [cycleId]
        )
      : [];
    const students = await db.all(
      `SELECT s.id AS student_id, s.matricula, u.nombre AS alumno
       FROM enrollments e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN users u ON u.id = s.user_id
       WHERE e.group_id = ? AND s.is_active = 1
       ORDER BY u.nombre`,
      [groupId]
    );
    const gradeRows = cycleId
      ? await db.all(
          `SELECT gr.student_id, gr.period_id, ap.numero, gr.calificacion, gr.observaciones
           FROM grades gr
           INNER JOIN academic_periods ap ON ap.id = gr.period_id
           WHERE gr.group_id = ? AND ap.school_cycle_id = ?`,
          [groupId, cycleId]
        )
      : [];
    const rows = students.map((student) => {
      const values = gradeRows.filter((grade) => grade.student_id === student.student_id);
      const numeric = values.map((grade) => grade.calificacion);
      const row = {
        id: student.student_id,
        student_id: student.student_id,
        matricula: student.matricula,
        alumno: student.alumno,
      };
      values.forEach((grade) => {
        row[`p${grade.numero}`] = grade.calificacion;
        row[`period_${grade.period_id}`] = grade.calificacion;
      });
      row.promedio = numeric.length
        ? Number((numeric.reduce((sum, value) => sum + value, 0) / numeric.length).toFixed(1))
        : null;
      return row;
    });
    return res.json({ group_id: groupId, school_cycle_id: cycleId, periods, rows });
  } catch (error) {
    console.error('listGroupGrades:', error);
    return res.status(500).json({ message: 'Error al consultar calificaciones.' });
  }
}

async function saveGroupGrades(req, res) {
  const db = await getDb();
  let inTransaction = false;
  try {
    const groupId = Number(req.params.groupId);
    if (!(await canAccessGroup(db, req.user, groupId, { write: true }))) {
      return res.status(403).json({ message: 'No puedes registrar calificaciones en este grupo.' });
    }
    const entries = Array.isArray(req.body.grades) ? req.body.grades : [];
    if (!entries.length) {
      return res.status(400).json({ message: 'Envía al menos una calificación.' });
    }
    const cycleId = await resolveCycleId(db, req.body.school_cycle_id, groupId);
    await db.exec('BEGIN IMMEDIATE');
    inTransaction = true;
    let saved = 0;
    for (const entry of entries) {
      const studentId = Number(entry.student_id);
      const periodId = Number(entry.period_id);
      const grade = Number(entry.calificacion);
      if (!studentId || !periodId || Number.isNaN(grade) || grade < 0 || grade > 10) {
        const error = new Error('Cada registro requiere student_id, period_id y calificación de 0 a 10.');
        error.status = 400;
        throw error;
      }
      const eligible = await db.get(
        `SELECT e.id
         FROM enrollments e
         INNER JOIN academic_periods ap ON ap.id = ?
         WHERE e.group_id = ? AND e.student_id = ? AND ap.school_cycle_id = ?`,
        [periodId, groupId, studentId, cycleId]
      );
      if (!eligible) {
        const error = new Error('El alumno o periodo no corresponde al grupo y ciclo seleccionados.');
        error.status = 400;
        throw error;
      }
      await db.run(
        `INSERT INTO grades
          (group_id, student_id, period_id, calificacion, observaciones, recorded_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(group_id, student_id, period_id) DO UPDATE SET
           calificacion = excluded.calificacion,
           observaciones = excluded.observaciones,
           recorded_by_user_id = excluded.recorded_by_user_id,
           updated_at = datetime('now')`,
        [groupId, studentId, periodId, grade, entry.observaciones || null, req.user.id]
      );
      saved += 1;
    }
    await db.exec('COMMIT');
    inTransaction = false;
    return res.json({ message: 'Calificaciones guardadas correctamente.', saved });
  } catch (error) {
    if (inTransaction) await db.exec('ROLLBACK');
    if (error.status === 400) return res.status(400).json({ message: error.message });
    console.error('saveGroupGrades:', error);
    return res.status(500).json({ message: 'Error al guardar calificaciones.' });
  }
}

async function buildStudentReport(db, studentId, schoolCycleId) {
  const cycleId = await resolveCycleId(db, schoolCycleId);
  const student = await db.get(
    `SELECT s.id, s.matricula, u.nombre, u.correo
     FROM students s INNER JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    [studentId]
  );
  if (!student) return null;
  const cycle = cycleId
    ? await db.get('SELECT * FROM school_cycles WHERE id = ?', [cycleId])
    : null;
  const rows = await db.all(
    `SELECT g.id AS group_id, sub.id AS subject_id,
            COALESCE(sub.clave, printf('MAT-%03d', sub.id)) AS code,
            sub.nombre AS subject, teacher_user.nombre AS teacher,
            c.nombre AS course_nombre, c.nivel AS course_nivel,
            g.nombre AS group_nombre, g.turno,
            ap.id AS period_id, ap.numero, gr.calificacion
     FROM enrollments e
     INNER JOIN groups g ON g.id = e.group_id
     INNER JOIN subjects sub ON sub.id = g.subject_id
     INNER JOIN courses c ON c.id = g.course_id
     INNER JOIN teachers t ON t.id = g.teacher_id
     INNER JOIN users teacher_user ON teacher_user.id = t.user_id
     LEFT JOIN grades gr ON gr.group_id = g.id AND gr.student_id = e.student_id
     LEFT JOIN academic_periods ap ON ap.id = gr.period_id
     WHERE e.student_id = ?
       AND (? IS NULL OR COALESCE(g.school_cycle_id, ?) = ?)
     ORDER BY sub.nombre, ap.numero`,
    [studentId, cycleId, cycleId, cycleId]
  );
  const subjectMap = new Map();
  rows.forEach((row) => {
    if (!subjectMap.has(row.group_id)) {
      subjectMap.set(row.group_id, {
        group_id: row.group_id,
        code: row.code,
        subject: row.subject,
        teacher: row.teacher,
        course: `${row.course_nombre} · ${row.course_nivel}`,
        group: row.group_nombre,
        shift: row.turno,
        grades: [],
      });
    }
    if (row.period_id) {
      const subject = subjectMap.get(row.group_id);
      subject[`p${row.numero}`] = row.calificacion;
      subject.grades.push(row.calificacion);
    }
  });
  const grades = [...subjectMap.values()].map((row) => {
    const final = row.grades.length
      ? Number((row.grades.reduce((sum, grade) => sum + grade, 0) / row.grades.length).toFixed(1))
      : null;
    const { grades: _raw, ...clean } = row;
    return {
      ...clean,
      final,
      status: final == null ? 'Sin captura' : final >= 6 ? 'Aprobado' : 'No aprobado',
    };
  });
  return {
    student,
    cycle,
    program: grades[0]?.course ?? '',
    grades,
    average: grades.filter((row) => row.final != null).length
      ? Number(
          (
            grades.filter((row) => row.final != null).reduce((sum, row) => sum + row.final, 0) /
            grades.filter((row) => row.final != null).length
          ).toFixed(1)
        )
      : null,
  };
}

async function getStudentGrades(req, res) {
  try {
    const studentId = Number(req.params.studentId);
    const db = await getDb();
    if (!(await canAccessStudent(db, req.user, studentId))) {
      return res.status(403).json({ message: 'No tienes acceso a las calificaciones de este alumno.' });
    }
    const report = await buildStudentReport(db, studentId, req.query.school_cycle_id);
    if (!report) return res.status(404).json({ message: 'Alumno no encontrado.' });
    return res.json(report);
  } catch (error) {
    console.error('getStudentGrades:', error);
    return res.status(500).json({ message: 'Error al consultar la boleta.' });
  }
}

module.exports = { listGroupGrades, saveGroupGrades, getStudentGrades, buildStudentReport };
