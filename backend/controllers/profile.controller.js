const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');

const SALT_ROUNDS = 10;

function mapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    role_id: row.role_id,
    role_nombre: row.role_nombre,
    is_active: Boolean(row.is_active),
  };
}

/** GET /api/profile */
async function getProfile(req, res) {
  try {
    const db = await getDb();
    const row = await db.get(
      `SELECT u.id, u.nombre, u.correo, u.role_id, u.is_active, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!row) {
      return res.status(404).json({ message: 'Perfil no encontrado.' });
    }

    return res.json({ profile: mapProfile(row) });
  } catch (error) {
    console.error('getProfile:', error);
    return res.status(500).json({ message: 'Error al obtener el perfil.' });
  }
}

/** PUT /api/profile */
async function updateProfile(req, res) {
  try {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre?.trim() || !correo?.trim()) {
      return res.status(400).json({ message: 'Nombre y correo son obligatorios.' });
    }

    const db = await getDb();
    const normalizedEmail = correo.trim().toLowerCase();

    const duplicate = await db.get(
      'SELECT id FROM users WHERE correo = ? AND id != ?',
      [normalizedEmail, req.user.id]
    );

    if (duplicate) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo.' });
    }

    if (contraseña) {
      const hashed = await bcrypt.hash(contraseña, SALT_ROUNDS);
      await db.run(
        `UPDATE users SET nombre = ?, correo = ?, contraseña = ? WHERE id = ?`,
        [nombre.trim(), normalizedEmail, hashed, req.user.id]
      );
    } else {
      await db.run(`UPDATE users SET nombre = ?, correo = ? WHERE id = ?`, [
        nombre.trim(),
        normalizedEmail,
        req.user.id,
      ]);
    }

    const row = await db.get(
      `SELECT u.id, u.nombre, u.correo, u.role_id, u.is_active, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    return res.json({
      message: 'Perfil actualizado correctamente.',
      profile: mapProfile(row),
    });
  } catch (error) {
    console.error('updateProfile:', error);
    return res.status(500).json({ message: 'Error al actualizar el perfil.' });
  }
}

module.exports = { getProfile, updateProfile };
