const { getDb } = require('../config/database');
const { validateActivityPayload } = require('../utils/academicValidation');

function mapActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    group_id: row.group_id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipo: row.tipo,
    fecha_entrega: row.fecha_entrega,
    subject_nombre: row.subject_nombre ?? null,
    course_nombre: row.course_nombre ?? null,
    course_nivel: row.course_nivel ?? null,
    teacher_nombre: row.teacher_nombre ?? null,
  };
}

function validationError(res, errors, message = 'Datos de actividad inválidos.') {
  return res.status(400).json({ message, errors });
}

const ACTIVITY_SELECT = `
  SELECT a.id, a.group_id, a.titulo, a.descripcion, a.tipo, a.fecha_entrega,
         sub.nombre AS subject_nombre,
         c.nombre AS course_nombre, c.nivel AS course_nivel,
         u.nombre AS teacher_nombre
  FROM activities_tasks a
  INNER JOIN groups g ON g.id = a.group_id
  INNER JOIN subjects sub ON sub.id = g.subject_id
  INNER JOIN courses c ON c.id = g.course_id
  INNER JOIN teachers t ON t.id = g.teacher_id
  INNER JOIN users u ON u.id = t.user_id
`;

/** GET /api/activities */
async function listActivities(req, res) {
  try {
    const { group_id, tipo, fecha_entrega, fecha_desde, fecha_hasta, teacher_id, teacher_user_id } =
      req.query;
    const conditions = [];
    const params = [];

    if (group_id) {
      conditions.push('a.group_id = ?');
      params.push(Number(group_id));
    }
    if (tipo) {
      conditions.push('a.tipo = ?');
      params.push(String(tipo).toLowerCase());
    }
    if (fecha_entrega) {
      conditions.push('a.fecha_entrega = ?');
      params.push(String(fecha_entrega));
    }
    if (fecha_desde) {
      conditions.push('a.fecha_entrega >= ?');
      params.push(String(fecha_desde));
    }
    if (fecha_hasta) {
      conditions.push('a.fecha_entrega <= ?');
      params.push(String(fecha_hasta));
    }
    if (teacher_id) {
      conditions.push('g.teacher_id = ?');
      params.push(Number(teacher_id));
    }
    if (teacher_user_id) {
      conditions.push('t.user_id = ?');
      params.push(Number(teacher_user_id));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = await getDb();
    const rows = await db.all(
      `${ACTIVITY_SELECT} ${whereClause} ORDER BY a.fecha_entrega ASC, a.id ASC`,
      params
    );

    return res.json({ activities: rows.map(mapActivity) });
  } catch (error) {
    console.error('listActivities:', error);
    return res.status(500).json({ message: 'Error al listar actividades.' });
  }
}

/**
 * GET /api/activities/pending?user_id=
 * Actividades de los grupos donde el alumno (por user_id) está inscrito,
 * ordenadas por fecha de entrega más próxima.
 */
async function listPendingForStudent(req, res) {
  try {
    const userId = Number(req.query.user_id);
    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        message: 'user_id es obligatorio.',
        errors: { user_id: 'Indica el usuario del alumno.' },
      });
    }

    const db = await getDb();
    const student = await db.get(
      'SELECT id FROM students WHERE user_id = ? AND is_active = 1',
      [userId]
    );

    if (!student) {
      return res.status(404).json({ message: 'No se encontró un alumno activo para ese usuario.' });
    }

    const rows = await db.all(
      `${ACTIVITY_SELECT}
       INNER JOIN enrollments e ON e.group_id = a.group_id
       WHERE e.student_id = ?
       ORDER BY a.fecha_entrega ASC, a.id ASC`,
      [student.id]
    );

    return res.json({
      student_id: student.id,
      activities: rows.map(mapActivity),
    });
  } catch (error) {
    console.error('listPendingForStudent:', error);
    return res.status(500).json({ message: 'Error al listar actividades pendientes.' });
  }
}

/** POST /api/activities */
async function createActivity(req, res) {
  try {
    const validation = validateActivityPayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const values = validation.values;
    const db = await getDb();
    const group = await db.get('SELECT id FROM groups WHERE id = ?', [values.group_id]);
    if (!group) {
      return validationError(res, { group_id: 'El grupo indicado no existe.' });
    }

    const result = await db.run(
      `INSERT INTO activities_tasks (group_id, titulo, descripcion, tipo, fecha_entrega)
       VALUES (?, ?, ?, ?, ?)`,
      [values.group_id, values.titulo, values.descripcion, values.tipo, values.fecha_entrega]
    );

    const row = await db.get(`${ACTIVITY_SELECT} WHERE a.id = ?`, [result.lastID]);
    return res.status(201).json({
      message: 'Actividad creada correctamente.',
      activity: mapActivity(row),
    });
  } catch (error) {
    console.error('createActivity:', error);
    return res.status(500).json({ message: 'Error al crear la actividad.' });
  }
}

/** PUT /api/activities/:id */
async function updateActivity(req, res) {
  try {
    const { id } = req.params;
    const validation = validateActivityPayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const db = await getDb();
    const current = await db.get('SELECT id FROM activities_tasks WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Actividad no encontrada.' });
    }

    const values = validation.values;
    const group = await db.get('SELECT id FROM groups WHERE id = ?', [values.group_id]);
    if (!group) {
      return validationError(res, { group_id: 'El grupo indicado no existe.' });
    }

    await db.run(
      `UPDATE activities_tasks
       SET group_id = ?, titulo = ?, descripcion = ?, tipo = ?, fecha_entrega = ?
       WHERE id = ?`,
      [
        values.group_id,
        values.titulo,
        values.descripcion,
        values.tipo,
        values.fecha_entrega,
        id,
      ]
    );

    const row = await db.get(`${ACTIVITY_SELECT} WHERE a.id = ?`, [id]);
    return res.json({
      message: 'Actividad actualizada correctamente.',
      activity: mapActivity(row),
    });
  } catch (error) {
    console.error('updateActivity:', error);
    return res.status(500).json({ message: 'Error al actualizar la actividad.' });
  }
}

/** DELETE /api/activities/:id */
async function deleteActivity(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id FROM activities_tasks WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Actividad no encontrada.' });
    }

    await db.run('DELETE FROM activities_tasks WHERE id = ?', [id]);
    return res.json({ message: 'Actividad eliminada correctamente.' });
  } catch (error) {
    console.error('deleteActivity:', error);
    return res.status(500).json({ message: 'Error al eliminar la actividad.' });
  }
}

module.exports = {
  listActivities,
  listPendingForStudent,
  createActivity,
  updateActivity,
  deleteActivity,
};
