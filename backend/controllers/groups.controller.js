const { getDb } = require('../config/database');
const { validateGroupPayload } = require('../utils/academicValidation');

function mapGroup(row) {
  if (!row) return null;
  const inscritos = Number(row.inscritos ?? 0);
  const capacidad = Number(row.capacidad_maxima);
  return {
    id: row.id,
    course_id: row.course_id,
    subject_id: row.subject_id,
    teacher_id: row.teacher_id,
    capacidad_maxima: capacidad,
    inscritos,
    cupos_disponibles: Math.max(capacidad - inscritos, 0),
    course_nombre: row.course_nombre ?? null,
    course_nivel: row.course_nivel ?? null,
    subject_nombre: row.subject_nombre ?? null,
    teacher_nombre: row.teacher_nombre ?? null,
    teacher_empleado: row.teacher_empleado ?? null,
  };
}

function validationError(res, errors, message = 'Datos de grupo inválidos.') {
  return res.status(400).json({ message, errors });
}

const GROUP_SELECT = `
  SELECT g.id, g.course_id, g.subject_id, g.teacher_id, g.capacidad_maxima,
         c.nombre AS course_nombre, c.nivel AS course_nivel,
         s.nombre AS subject_nombre,
         u.nombre AS teacher_nombre, t.numero_empleado AS teacher_empleado,
         (SELECT COUNT(*) FROM enrollments e WHERE e.group_id = g.id) AS inscritos
  FROM groups g
  INNER JOIN courses c ON c.id = g.course_id
  INNER JOIN subjects s ON s.id = g.subject_id
  INNER JOIN teachers t ON t.id = g.teacher_id
  INNER JOIN users u ON u.id = t.user_id
`;

async function assertGroupRefs(db, { course_id, subject_id, teacher_id }) {
  const errors = {};
  const course = await db.get('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) errors.course_id = 'El curso indicado no existe.';

  const subject = await db.get('SELECT id FROM subjects WHERE id = ?', [subject_id]);
  if (!subject) errors.subject_id = 'La materia indicada no existe.';

  const teacher = await db.get(
    'SELECT id FROM teachers WHERE id = ? AND is_active = 1',
    [teacher_id]
  );
  if (!teacher) errors.teacher_id = 'El profesor no existe o está inactivo.';

  return errors;
}

/** GET /api/groups */
async function listGroups(req, res) {
  try {
    const { search } = req.query;
    const conditions = [];
    const params = [];

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push(
        '(c.nombre LIKE ? OR c.nivel LIKE ? OR s.nombre LIKE ? OR u.nombre LIKE ? OR t.numero_empleado LIKE ?)'
      );
      params.push(term, term, term, term, term);
    }

    if (req.query.teacher_id) {
      conditions.push('g.teacher_id = ?');
      params.push(Number(req.query.teacher_id));
    }

    if (req.query.teacher_user_id) {
      conditions.push('t.user_id = ?');
      params.push(Number(req.query.teacher_user_id));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = await getDb();
    const rows = await db.all(
      `${GROUP_SELECT} ${whereClause} ORDER BY g.id ASC`,
      params
    );

    return res.json({ groups: rows.map(mapGroup) });
  } catch (error) {
    console.error('listGroups:', error);
    return res.status(500).json({ message: 'Error al listar grupos.' });
  }
}

/** GET /api/groups/:id */
async function getGroup(req, res) {
  try {
    const db = await getDb();
    const row = await db.get(`${GROUP_SELECT} WHERE g.id = ?`, [req.params.id]);
    if (!row) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }
    return res.json({ group: mapGroup(row) });
  } catch (error) {
    console.error('getGroup:', error);
    return res.status(500).json({ message: 'Error al obtener el grupo.' });
  }
}

/** POST /api/groups */
async function createGroup(req, res) {
  try {
    const validation = validateGroupPayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const values = validation.values;
    const db = await getDb();
    const refErrors = await assertGroupRefs(db, values);
    if (Object.keys(refErrors).length) {
      return validationError(res, refErrors);
    }

    const result = await db.run(
      `INSERT INTO groups (course_id, subject_id, teacher_id, capacidad_maxima)
       VALUES (?, ?, ?, ?)`,
      [values.course_id, values.subject_id, values.teacher_id, values.capacidad_maxima]
    );

    const row = await db.get(`${GROUP_SELECT} WHERE g.id = ?`, [result.lastID]);
    return res.status(201).json({
      message: 'Grupo creado correctamente.',
      group: mapGroup(row),
    });
  } catch (error) {
    console.error('createGroup:', error);
    return res.status(500).json({ message: 'Error al crear el grupo.' });
  }
}

/** PUT /api/groups/:id */
async function updateGroup(req, res) {
  try {
    const { id } = req.params;
    const validation = validateGroupPayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const db = await getDb();
    const current = await db.get('SELECT id FROM groups WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    const values = validation.values;
    const refErrors = await assertGroupRefs(db, values);
    if (Object.keys(refErrors).length) {
      return validationError(res, refErrors);
    }

    const inscritos = await db.get(
      'SELECT COUNT(*) AS total FROM enrollments WHERE group_id = ?',
      [id]
    );
    if (values.capacidad_maxima < Number(inscritos.total)) {
      return validationError(res, {
        capacidad_maxima: `La capacidad no puede ser menor a los inscritos actuales (${inscritos.total}).`,
      });
    }

    await db.run(
      `UPDATE groups
       SET course_id = ?, subject_id = ?, teacher_id = ?, capacidad_maxima = ?
       WHERE id = ?`,
      [values.course_id, values.subject_id, values.teacher_id, values.capacidad_maxima, id]
    );

    const row = await db.get(`${GROUP_SELECT} WHERE g.id = ?`, [id]);
    return res.json({
      message: 'Grupo actualizado correctamente.',
      group: mapGroup(row),
    });
  } catch (error) {
    console.error('updateGroup:', error);
    return res.status(500).json({ message: 'Error al actualizar el grupo.' });
  }
}

/** DELETE /api/groups/:id */
async function deleteGroup(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id FROM groups WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    await db.run('DELETE FROM groups WHERE id = ?', [id]);
    return res.json({ message: 'Grupo eliminado correctamente.' });
  } catch (error) {
    console.error('deleteGroup:', error);
    return res.status(500).json({ message: 'Error al eliminar el grupo.' });
  }
}

/** GET /api/groups/:id/students */
async function listGroupStudents(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const group = await db.get(`${GROUP_SELECT} WHERE g.id = ?`, [id]);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    const students = await db.all(
      `SELECT e.id AS enrollment_id, e.fecha_inscripcion,
              s.id AS student_id, s.matricula, s.is_active,
              u.nombre, u.correo
       FROM enrollments e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN users u ON u.id = s.user_id
       WHERE e.group_id = ?
       ORDER BY e.fecha_inscripcion ASC, s.matricula ASC`,
      [id]
    );

    return res.json({
      group: mapGroup(group),
      students: students.map((row) => ({
        enrollment_id: row.enrollment_id,
        student_id: row.student_id,
        matricula: row.matricula,
        nombre: row.nombre,
        correo: row.correo,
        is_active: Boolean(row.is_active),
        fecha_inscripcion: row.fecha_inscripcion,
      })),
    });
  } catch (error) {
    console.error('listGroupStudents:', error);
    return res.status(500).json({ message: 'Error al listar inscritos del grupo.' });
  }
}

module.exports = {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  listGroupStudents,
};
