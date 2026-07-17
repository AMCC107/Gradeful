const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { signToken } = require('../config/auth');

function mapAuthUser(row) {
  return {
    id: row.id,
    name: row.nombre,
    email: row.correo,
    role: row.role_id,
    roleName: row.role_nombre,
    adminId: row.role_id === 1 ? `ADM-${String(row.id).padStart(3, '0')}` : undefined,
    parentId: row.role_id === 2 ? `PAD-${String(row.id).padStart(4, '0')}` : undefined,
    studentId: row.role_id === 3 ? `EST-${String(row.id).padStart(4, '0')}` : undefined,
    teacherId: row.role_id === 4 ? `DOC-${String(row.id).padStart(3, '0')}` : undefined,
  };
}

/** POST /api/auth/login */
async function login(req, res) {
  try {
    const { email, password, correo, contraseña } = req.body;
    const loginEmail = (email || correo || '').trim().toLowerCase();
    const loginPassword = password || contraseña;

    if (!loginEmail || !loginPassword) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
    }

    const db = await getDb();
    const user = await db.get(
      `SELECT u.*, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.correo = ?`,
      [loginEmail]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const valid = await bcrypt.compare(loginPassword, user.contraseña);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signToken({ userId: user.id, roleId: user.role_id });

    return res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: mapAuthUser(user),
    });
  } catch (error) {
    console.error('login:', error);
    return res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
}

module.exports = { login };
