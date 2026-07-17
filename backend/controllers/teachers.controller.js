const { getDb } = require('../config/database');
const {
  ROLE_TEACHER,
  validateTeacherPayload,
} = require('../utils/academicValidation');

function mapTeacher(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    numero_empleado: row.numero_empleado,
    especialidad: row.especialidad,
    is_active: Boolean(row.is_active),
    nombre: row.nombre ?? null,
    correo: row.correo ?? null,
    role_id: row.role_id ?? null,
  };
}

function validationError(res, errors, message = 'Datos de profesor inválidos.') {
  return res.status(400).json({ message, errors });
}

async function assertEligibleTeacherUser(db, userId, excludeTeacherId = null) {
  const user = await db.get(
    'SELECT id, nombre, correo, is_active, role_id FROM users WHERE id = ?',
    [userId]
  );

  if (!user) {
    return { error: { user_id: 'El usuario indicado no existe.' } };
  }
  if (!user.is_active) {
    return { error: { user_id: 'El usuario está inactivo.' } };
  }
  if (user.role_id !== ROLE_TEACHER) {
    return { error: { user_id: 'El usuario debe tener rol de Profesor.' } };
  }

  const linked = await db.get(
    excludeTeacherId
      ? 'SELECT id FROM teachers WHERE user_id = ? AND id != ?'
      : 'SELECT id FROM teachers WHERE user_id = ?',
    excludeTeacherId ? [userId, excludeTeacherId] : [userId]
  );

  if (linked) {
    return { error: { user_id: 'Este usuario ya está registrado como profesor.' } };
  }

  return { user };
}

/** GET /api/teachers */
async function listTeachers(req, res) {
  try {
    const { search, status } = req.query;
    const conditions = [];
    const params = [];

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push(
        '(t.numero_empleado LIKE ? OR t.especialidad LIKE ? OR u.nombre LIKE ? OR u.correo LIKE ?)'
      );
      params.push(term, term, term, term);
    }

    if (status !== undefined && status !== null && String(status).trim() !== '') {
      const normalized = String(status).trim().toLowerCase();
      if (['1', 'true', 'active', 'activo'].includes(normalized)) {
        conditions.push('t.is_active = ?');
        params.push(1);
      } else if (['0', 'false', 'inactive', 'inactivo'].includes(normalized)) {
        conditions.push('t.is_active = ?');
        params.push(0);
      }
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = await getDb();
    const rows = await db.all(
      `SELECT t.id, t.user_id, t.numero_empleado, t.especialidad, t.is_active,
              u.nombre, u.correo, u.role_id
       FROM teachers t
       INNER JOIN users u ON u.id = t.user_id
       ${whereClause}
       ORDER BY t.id ASC`,
      params
    );

    return res.json({ teachers: rows.map(mapTeacher) });
  } catch (error) {
    console.error('listTeachers:', error);
    return res.status(500).json({ message: 'Error al listar profesores.' });
  }
}

/** GET /api/teachers/:id */
async function getTeacher(req, res) {
  try {
    const db = await getDb();
    const row = await db.get(
      `SELECT t.id, t.user_id, t.numero_empleado, t.especialidad, t.is_active,
              u.nombre, u.correo, u.role_id
       FROM teachers t
       INNER JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (!row) {
      return res.status(404).json({ message: 'Profesor no encontrado.' });
    }

    return res.json({ teacher: mapTeacher(row) });
  } catch (error) {
    console.error('getTeacher:', error);
    return res.status(500).json({ message: 'Error al obtener el profesor.' });
  }
}

/** POST /api/teachers */
async function createTeacher(req, res) {
  try {
    const validation = validateTeacherPayload(req.body, { isUpdate: false });
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const { user_id, numero_empleado, especialidad } = validation.values;
    const db = await getDb();

    const eligibility = await assertEligibleTeacherUser(db, user_id);
    if (eligibility.error) {
      return validationError(res, eligibility.error);
    }

    const dupEmp = await db.get('SELECT id FROM teachers WHERE numero_empleado = ?', [
      numero_empleado,
    ]);
    if (dupEmp) {
      return validationError(res, {
        numero_empleado: 'Ya existe un profesor con ese número de empleado.',
      });
    }

    const result = await db.run(
      `INSERT INTO teachers (user_id, numero_empleado, especialidad, is_active)
       VALUES (?, ?, ?, 1)`,
      [user_id, numero_empleado, especialidad]
    );

    const row = await db.get(
      `SELECT t.id, t.user_id, t.numero_empleado, t.especialidad, t.is_active,
              u.nombre, u.correo, u.role_id
       FROM teachers t
       INNER JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Profesor creado correctamente.',
      teacher: mapTeacher(row),
    });
  } catch (error) {
    console.error('createTeacher:', error);
    return res.status(500).json({ message: 'Error al crear el profesor.' });
  }
}

/** PUT /api/teachers/:id */
async function updateTeacher(req, res) {
  try {
    const { id } = req.params;
    const validation = validateTeacherPayload(req.body, { isUpdate: true });
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const db = await getDb();
    const current = await db.get('SELECT * FROM teachers WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Profesor no encontrado.' });
    }

    const { numero_empleado, especialidad } = validation.values;
    let userId = current.user_id;

    if (req.body.user_id !== undefined && req.body.user_id !== null && req.body.user_id !== '') {
      userId = validation.values.user_id;
      const eligibility = await assertEligibleTeacherUser(db, userId, Number(id));
      if (eligibility.error) {
        return validationError(res, eligibility.error);
      }
    }

    const dupEmp = await db.get(
      'SELECT id FROM teachers WHERE numero_empleado = ? AND id != ?',
      [numero_empleado, id]
    );
    if (dupEmp) {
      return validationError(res, {
        numero_empleado: 'Ya existe un profesor con ese número de empleado.',
      });
    }

    await db.run(
      `UPDATE teachers SET user_id = ?, numero_empleado = ?, especialidad = ? WHERE id = ?`,
      [userId, numero_empleado, especialidad, id]
    );

    const row = await db.get(
      `SELECT t.id, t.user_id, t.numero_empleado, t.especialidad, t.is_active,
              u.nombre, u.correo, u.role_id
       FROM teachers t
       INNER JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`,
      [id]
    );

    return res.json({
      message: 'Profesor actualizado correctamente.',
      teacher: mapTeacher(row),
    });
  } catch (error) {
    console.error('updateTeacher:', error);
    return res.status(500).json({ message: 'Error al actualizar el profesor.' });
  }
}

/** PATCH /api/teachers/:id/deactivate */
async function deactivateTeacher(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id, is_active FROM teachers WHERE id = ?', [id]);

    if (!current) {
      return res.status(404).json({ message: 'Profesor no encontrado.' });
    }
    if (!current.is_active) {
      return res.status(400).json({ message: 'El profesor ya está desactivado.' });
    }

    await db.run('UPDATE teachers SET is_active = 0 WHERE id = ?', [id]);

    const row = await db.get(
      `SELECT t.id, t.user_id, t.numero_empleado, t.especialidad, t.is_active,
              u.nombre, u.correo, u.role_id
       FROM teachers t
       INNER JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`,
      [id]
    );

    return res.json({
      message: 'Profesor desactivado correctamente.',
      teacher: mapTeacher(row),
    });
  } catch (error) {
    console.error('deactivateTeacher:', error);
    return res.status(500).json({ message: 'Error al desactivar el profesor.' });
  }
}

module.exports = {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deactivateTeacher,
};
