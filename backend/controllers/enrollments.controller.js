const { getDb } = require('../config/database');
const { validateEnrollmentPayload } = require('../utils/academicValidation');

function validationError(res, errors, message = 'Datos de inscripción inválidos.') {
  return res.status(400).json({ message, errors });
}

function mapEnrollment(row) {
  if (!row) return null;
  return {
    id: row.id,
    group_id: row.group_id,
    student_id: row.student_id,
    fecha_inscripcion: row.fecha_inscripcion,
    matricula: row.matricula ?? null,
    student_nombre: row.student_nombre ?? null,
    student_correo: row.student_correo ?? null,
    subject_nombre: row.subject_nombre ?? null,
    course_nombre: row.course_nombre ?? null,
    course_nivel: row.course_nivel ?? null,
  };
}

/** GET /api/enrollments */
async function listEnrollments(req, res) {
  try {
    const { group_id, student_id } = req.query;
    const conditions = [];
    const params = [];

    if (group_id) {
      conditions.push('e.group_id = ?');
      params.push(Number(group_id));
    }
    if (student_id) {
      conditions.push('e.student_id = ?');
      params.push(Number(student_id));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = await getDb();
    const rows = await db.all(
      `SELECT e.id, e.group_id, e.student_id, e.fecha_inscripcion,
              s.matricula, u.nombre AS student_nombre, u.correo AS student_correo,
              sub.nombre AS subject_nombre, c.nombre AS course_nombre, c.nivel AS course_nivel
       FROM enrollments e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN groups g ON g.id = e.group_id
       INNER JOIN subjects sub ON sub.id = g.subject_id
       INNER JOIN courses c ON c.id = g.course_id
       ${whereClause}
       ORDER BY e.fecha_inscripcion DESC`,
      params
    );

    return res.json({ enrollments: rows.map(mapEnrollment) });
  } catch (error) {
    console.error('listEnrollments:', error);
    return res.status(500).json({ message: 'Error al listar inscripciones.' });
  }
}

/**
 * POST /api/enrollments
 * Regla crítica: no superar capacidad_maxima del grupo.
 */
async function createEnrollment(req, res) {
  try {
    const validation = validateEnrollmentPayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const { group_id, student_id } = validation.values;
    const db = await getDb();

    const group = await db.get(
      'SELECT id, capacidad_maxima FROM groups WHERE id = ?',
      [group_id]
    );
    if (!group) {
      return validationError(res, { group_id: 'El grupo indicado no existe.' });
    }

    const student = await db.get(
      'SELECT id, is_active FROM students WHERE id = ?',
      [student_id]
    );
    if (!student) {
      return validationError(res, { student_id: 'El alumno indicado no existe.' });
    }
    if (!student.is_active) {
      return validationError(res, { student_id: 'El alumno está inactivo.' });
    }

    const already = await db.get(
      'SELECT id FROM enrollments WHERE group_id = ? AND student_id = ?',
      [group_id, student_id]
    );
    if (already) {
      return validationError(res, {
        student_id: 'El alumno ya está inscrito en este grupo.',
      });
    }

    const countRow = await db.get(
      'SELECT COUNT(*) AS total FROM enrollments WHERE group_id = ?',
      [group_id]
    );
    const inscritos = Number(countRow.total);
    if (inscritos >= group.capacidad_maxima) {
      return res.status(400).json({
        message: 'El grupo ha alcanzado su capacidad máxima. No hay cupos disponibles.',
        errors: {
          group_id: `Cupo lleno (${inscritos}/${group.capacidad_maxima}).`,
        },
        cupos: {
          capacidad_maxima: group.capacidad_maxima,
          inscritos,
          cupos_disponibles: 0,
        },
      });
    }

    const result = await db.run(
      `INSERT INTO enrollments (group_id, student_id, fecha_inscripcion)
       VALUES (?, ?, datetime('now'))`,
      [group_id, student_id]
    );

    const row = await db.get(
      `SELECT e.id, e.group_id, e.student_id, e.fecha_inscripcion,
              s.matricula, u.nombre AS student_nombre, u.correo AS student_correo,
              sub.nombre AS subject_nombre, c.nombre AS course_nombre, c.nivel AS course_nivel
       FROM enrollments e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN groups g ON g.id = e.group_id
       INNER JOIN subjects sub ON sub.id = g.subject_id
       INNER JOIN courses c ON c.id = g.course_id
       WHERE e.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Inscripción realizada correctamente.',
      enrollment: mapEnrollment(row),
      cupos: {
        capacidad_maxima: group.capacidad_maxima,
        inscritos: inscritos + 1,
        cupos_disponibles: Math.max(group.capacidad_maxima - (inscritos + 1), 0),
      },
    });
  } catch (error) {
    console.error('createEnrollment:', error);
    return res.status(500).json({ message: 'Error al crear la inscripción.' });
  }
}

/** DELETE /api/enrollments/:id */
async function deleteEnrollment(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id FROM enrollments WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Inscripción no encontrada.' });
    }

    await db.run('DELETE FROM enrollments WHERE id = ?', [id]);
    return res.json({ message: 'Inscripción eliminada correctamente.' });
  } catch (error) {
    console.error('deleteEnrollment:', error);
    return res.status(500).json({ message: 'Error al eliminar la inscripción.' });
  }
}

module.exports = {
  listEnrollments,
  createEnrollment,
  deleteEnrollment,
};
