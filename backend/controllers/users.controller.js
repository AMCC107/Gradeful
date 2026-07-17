const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { validateUserPayload } = require('../utils/userValidation');

const SALT_ROUNDS = 10;

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    is_active: Boolean(row.is_active),
    role_id: row.role_id,
    role_nombre: row.role_nombre ?? null,
  };
}

function validationErrorResponse(res, errors, message = 'Datos de usuario inválidos.') {
  return res.status(400).json({ message, errors });
}

/** POST /api/users — Crear usuario */
async function createUser(req, res) {
  try {
    const validation = validateUserPayload(req.body, { isUpdate: false });
    if (!validation.isValid) {
      return validationErrorResponse(res, validation.errors);
    }

    const { nombre, correo, contraseña, role_id } = validation.values;
    const db = await getDb();

    const existing = await db.get('SELECT id FROM users WHERE correo = ?', [correo]);
    if (existing) {
      return validationErrorResponse(
        res,
        { correo: 'Ya existe un usuario con ese correo.' },
        'Ya existe un usuario con ese correo.'
      );
    }

    const role = await db.get('SELECT id FROM roles WHERE id = ?', [role_id]);
    if (!role) {
      return validationErrorResponse(res, { role_id: 'El rol indicado no existe.' });
    }

    const hashed = await bcrypt.hash(contraseña, SALT_ROUNDS);
    const result = await db.run(
      `INSERT INTO users (nombre, correo, contraseña, is_active, role_id)
       VALUES (?, ?, ?, 1, ?)`,
      [nombre, correo, hashed, role_id]
    );

    const user = await db.get(
      `SELECT u.id, u.nombre, u.correo, u.is_active, u.role_id, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Usuario creado correctamente.',
      user: mapUser(user),
    });
  } catch (error) {
    console.error('createUser:', error);
    return res.status(500).json({ message: 'Error al crear el usuario.' });
  }
}

/**
 * GET /api/users
 * Query params: search, role, status (active|inactive|1|0|true|false)
 */
async function listUsers(req, res) {
  try {
    const { search, role, status } = req.query;
    const db = await getDb();

    const conditions = [];
    const params = [];

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push('(u.nombre LIKE ? OR u.correo LIKE ?)');
      params.push(term, term);
    }

    if (role !== undefined && role !== null && String(role).trim() !== '') {
      const roleId = Number(role);
      if (!Number.isNaN(roleId)) {
        conditions.push('u.role_id = ?');
        params.push(roleId);
      }
    }

    if (status !== undefined && status !== null && String(status).trim() !== '') {
      const normalized = String(status).trim().toLowerCase();
      if (['1', 'true', 'active', 'activo'].includes(normalized)) {
        conditions.push('u.is_active = ?');
        params.push(1);
      } else if (['0', 'false', 'inactive', 'inactivo'].includes(normalized)) {
        conditions.push('u.is_active = ?');
        params.push(0);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = await db.all(
      `SELECT u.id, u.nombre, u.correo, u.is_active, u.role_id, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       ${whereClause}
       ORDER BY u.id ASC`,
      params
    );

    const roles = await db.all('SELECT id, nombre FROM roles ORDER BY id ASC');

    return res.json({
      users: rows.map(mapUser),
      roles,
      filters: {
        search: search ? String(search) : '',
        role: role ?? '',
        status: status ?? '',
      },
    });
  } catch (error) {
    console.error('listUsers:', error);
    return res.status(500).json({ message: 'Error al listar usuarios.' });
  }
}

/** PUT /api/users/:id — Editar usuario */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const validation = validateUserPayload(req.body, { isUpdate: true });
    if (!validation.isValid) {
      return validationErrorResponse(res, validation.errors);
    }

    const { nombre, correo, contraseña, role_id } = validation.values;
    const db = await getDb();
    const current = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!current) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const duplicate = await db.get(
      'SELECT id FROM users WHERE correo = ? AND id != ?',
      [correo, id]
    );

    if (duplicate) {
      return validationErrorResponse(
        res,
        { correo: 'Ya existe un usuario con ese correo.' },
        'Ya existe un usuario con ese correo.'
      );
    }

    const role = await db.get('SELECT id FROM roles WHERE id = ?', [role_id]);
    if (!role) {
      return validationErrorResponse(res, { role_id: 'El rol indicado no existe.' });
    }

    if (contraseña) {
      const hashed = await bcrypt.hash(contraseña, SALT_ROUNDS);
      await db.run(
        `UPDATE users SET nombre = ?, correo = ?, contraseña = ?, role_id = ? WHERE id = ?`,
        [nombre, correo, hashed, role_id, id]
      );
    } else {
      await db.run(
        `UPDATE users SET nombre = ?, correo = ?, role_id = ? WHERE id = ?`,
        [nombre, correo, role_id, id]
      );
    }

    const user = await db.get(
      `SELECT u.id, u.nombre, u.correo, u.is_active, u.role_id, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [id]
    );

    return res.json({
      message: 'Usuario actualizado correctamente.',
      user: mapUser(user),
    });
  } catch (error) {
    console.error('updateUser:', error);
    return res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
}

/** PATCH /api/users/:id/deactivate — Soft delete */
async function deactivateUser(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id, is_active FROM users WHERE id = ?', [id]);

    if (!current) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!current.is_active) {
      return res.status(400).json({ message: 'El usuario ya está desactivado.' });
    }

    await db.run('UPDATE users SET is_active = 0 WHERE id = ?', [id]);

    const user = await db.get(
      `SELECT u.id, u.nombre, u.correo, u.is_active, u.role_id, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [id]
    );

    return res.json({
      message: 'Usuario desactivado correctamente.',
      user: mapUser(user),
    });
  } catch (error) {
    console.error('deactivateUser:', error);
    return res.status(500).json({ message: 'Error al desactivar el usuario.' });
  }
}

module.exports = {
  createUser,
  listUsers,
  updateUser,
  deactivateUser,
};
