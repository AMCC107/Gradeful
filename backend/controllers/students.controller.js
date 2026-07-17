const { getDb } = require('../config/database');
const {
  ROLE_STUDENT,
  validateStudentPayload,
} = require('../utils/academicValidation');

function mapStudent(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    matricula: row.matricula,
    is_active: Boolean(row.is_active),
    nombre: row.nombre ?? null,
    correo: row.correo ?? null,
    role_id: row.role_id ?? null,
  };
}

function validationError(res, errors, message = 'Datos de alumno inválidos.') {
  return res.status(400).json({ message, errors });
}

async function assertEligibleStudentUser(db, userId, excludeStudentId = null) {
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
  if (user.role_id !== ROLE_STUDENT) {
    return { error: { user_id: 'El usuario debe tener rol de Estudiante.' } };
  }

  const linked = await db.get(
    excludeStudentId
      ? 'SELECT id FROM students WHERE user_id = ? AND id != ?'
      : 'SELECT id FROM students WHERE user_id = ?',
    excludeStudentId ? [userId, excludeStudentId] : [userId]
  );

  if (linked) {
    return { error: { user_id: 'Este usuario ya está registrado como alumno.' } };
  }

  return { user };
}

/** GET /api/students */
async function listStudents(req, res) {
  try {
    const { search, status } = req.query;
    const conditions = [];
    const params = [];

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push('(s.matricula LIKE ? OR u.nombre LIKE ? OR u.correo LIKE ?)');
      params.push(term, term, term);
    }

    if (status !== undefined && status !== null && String(status).trim() !== '') {
      const normalized = String(status).trim().toLowerCase();
      if (['1', 'true', 'active', 'activo'].includes(normalized)) {
        conditions.push('s.is_active = ?');
        params.push(1);
      } else if (['0', 'false', 'inactive', 'inactivo'].includes(normalized)) {
        conditions.push('s.is_active = ?');
        params.push(0);
      }
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = await getDb();
    const rows = await db.all(
      `SELECT s.id, s.user_id, s.matricula, s.is_active,
              u.nombre, u.correo, u.role_id
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       ${whereClause}
       ORDER BY s.id ASC`,
      params
    );

    return res.json({ students: rows.map(mapStudent) });
  } catch (error) {
    console.error('listStudents:', error);
    return res.status(500).json({ message: 'Error al listar alumnos.' });
  }
}

/** GET /api/students/:id */
async function getStudent(req, res) {
  try {
    const db = await getDb();
    const row = await db.get(
      `SELECT s.id, s.user_id, s.matricula, s.is_active,
              u.nombre, u.correo, u.role_id
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (!row) {
      return res.status(404).json({ message: 'Alumno no encontrado.' });
    }

    return res.json({ student: mapStudent(row) });
  } catch (error) {
    console.error('getStudent:', error);
    return res.status(500).json({ message: 'Error al obtener el alumno.' });
  }
}

/** POST /api/students */
async function createStudent(req, res) {
  try {
    const validation = validateStudentPayload(req.body, { isUpdate: false });
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const { user_id, matricula } = validation.values;
    const db = await getDb();

    const eligibility = await assertEligibleStudentUser(db, user_id);
    if (eligibility.error) {
      return validationError(res, eligibility.error);
    }

    const dupMatricula = await db.get('SELECT id FROM students WHERE matricula = ?', [
      matricula,
    ]);
    if (dupMatricula) {
      return validationError(res, { matricula: 'Ya existe un alumno con esa matrícula.' });
    }

    const result = await db.run(
      `INSERT INTO students (user_id, matricula, is_active) VALUES (?, ?, 1)`,
      [user_id, matricula]
    );

    const row = await db.get(
      `SELECT s.id, s.user_id, s.matricula, s.is_active,
              u.nombre, u.correo, u.role_id
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Alumno creado correctamente.',
      student: mapStudent(row),
    });
  } catch (error) {
    console.error('createStudent:', error);
    return res.status(500).json({ message: 'Error al crear el alumno.' });
  }
}

/** PUT /api/students/:id */
async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const validation = validateStudentPayload(req.body, { isUpdate: true });
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const db = await getDb();
    const current = await db.get('SELECT * FROM students WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Alumno no encontrado.' });
    }

    const { matricula } = validation.values;
    let userId = current.user_id;

    if (req.body.user_id !== undefined && req.body.user_id !== null && req.body.user_id !== '') {
      userId = validation.values.user_id;
      const eligibility = await assertEligibleStudentUser(db, userId, Number(id));
      if (eligibility.error) {
        return validationError(res, eligibility.error);
      }
    }

    const dupMatricula = await db.get(
      'SELECT id FROM students WHERE matricula = ? AND id != ?',
      [matricula, id]
    );
    if (dupMatricula) {
      return validationError(res, { matricula: 'Ya existe un alumno con esa matrícula.' });
    }

    await db.run(`UPDATE students SET user_id = ?, matricula = ? WHERE id = ?`, [
      userId,
      matricula,
      id,
    ]);

    const row = await db.get(
      `SELECT s.id, s.user_id, s.matricula, s.is_active,
              u.nombre, u.correo, u.role_id
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [id]
    );

    return res.json({
      message: 'Alumno actualizado correctamente.',
      student: mapStudent(row),
    });
  } catch (error) {
    console.error('updateStudent:', error);
    return res.status(500).json({ message: 'Error al actualizar el alumno.' });
  }
}

/** PATCH /api/students/:id/deactivate */
async function deactivateStudent(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id, is_active FROM students WHERE id = ?', [id]);

    if (!current) {
      return res.status(404).json({ message: 'Alumno no encontrado.' });
    }
    if (!current.is_active) {
      return res.status(400).json({ message: 'El alumno ya está desactivado.' });
    }

    await db.run('UPDATE students SET is_active = 0 WHERE id = ?', [id]);

    const row = await db.get(
      `SELECT s.id, s.user_id, s.matricula, s.is_active,
              u.nombre, u.correo, u.role_id
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [id]
    );

    return res.json({
      message: 'Alumno desactivado correctamente.',
      student: mapStudent(row),
    });
  } catch (error) {
    console.error('deactivateStudent:', error);
    return res.status(500).json({ message: 'Error al desactivar el alumno.' });
  }
}

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deactivateStudent,
};
