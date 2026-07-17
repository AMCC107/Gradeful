const { getDb } = require('../config/database');
const { verifyToken } = require('../config/auth');

/**
 * Extrae el usuario autenticado desde Bearer JWT
 * y lo adjunta en req.user.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'No autenticado. Token requerido.' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    const db = await getDb();
    const user = await db.get(
      `SELECT u.id, u.nombre, u.correo, u.is_active, u.role_id, r.nombre AS role_nombre
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [decoded.userId]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Usuario no válido o inactivo.' });
    }

    req.user = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      role_id: user.role_id,
      role_nombre: user.role_nombre,
      is_active: Boolean(user.is_active),
    };

    return next();
  } catch (error) {
    console.error('authenticate:', error);
    return res.status(500).json({ message: 'Error de autenticación.' });
  }
}

/**
 * Verifica en BD si el role_id del usuario tiene el permiso indicado.
 */
function checkPermission(permissionName) {
  return async (req, res, next) => {
    try {
      if (!req.user?.role_id) {
        return res.status(401).json({ message: 'No autenticado.' });
      }

      const db = await getDb();
      const row = await db.get(
        `SELECT p.id
         FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         WHERE rp.role_id = ? AND p.nombre = ?`,
        [req.user.role_id, permissionName]
      );

      if (!row) {
        return res.status(403).json({
          message: `No tienes el permiso requerido: ${permissionName}`,
        });
      }

      return next();
    } catch (error) {
      console.error('checkPermission:', error);
      return res.status(500).json({ message: 'Error al verificar permisos.' });
    }
  };
}

module.exports = { authenticate, checkPermission };
