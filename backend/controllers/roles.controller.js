const { getDb } = require('../config/database');

async function getPermissionsForRole(db, roleId) {
  return db.all(
    `SELECT p.id, p.nombre, p.descripcion
     FROM permissions p
     INNER JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_id = ?
     ORDER BY p.nombre ASC`,
    [roleId]
  );
}

async function syncRolePermissions(db, roleId, permissionIds = []) {
  const uniqueIds = [...new Set(permissionIds.map(Number).filter(Boolean))];

  await db.run('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

  for (const permissionId of uniqueIds) {
    const exists = await db.get('SELECT id FROM permissions WHERE id = ?', [permissionId]);
    if (!exists) continue;
    await db.run(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
      [roleId, permissionId]
    );
  }
}

/** GET /api/roles */
async function listRoles(_req, res) {
  try {
    const db = await getDb();
    const roles = await db.all('SELECT id, nombre, descripcion FROM roles ORDER BY id ASC');
    const permissions = await db.all(
      'SELECT id, nombre, descripcion FROM permissions ORDER BY nombre ASC'
    );

    const withPermissions = [];
    for (const role of roles) {
      const rolePermissions = await getPermissionsForRole(db, role.id);
      withPermissions.push({ ...role, permissions: rolePermissions });
    }

    return res.json({ roles: withPermissions, permissions });
  } catch (error) {
    console.error('listRoles:', error);
    return res.status(500).json({ message: 'Error al listar roles.' });
  }
}

/** POST /api/roles */
async function createRole(req, res) {
  try {
    const { nombre, descripcion, permissionIds } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM roles WHERE nombre = ?', [nombre.trim()]);
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un rol con ese nombre.' });
    }

    const result = await db.run(
      `INSERT INTO roles (nombre, descripcion) VALUES (?, ?)`,
      [nombre.trim(), descripcion?.trim() || null]
    );

    await syncRolePermissions(db, result.lastID, permissionIds || []);

    const role = await db.get('SELECT id, nombre, descripcion FROM roles WHERE id = ?', [
      result.lastID,
    ]);
    const permissions = await getPermissionsForRole(db, result.lastID);

    return res.status(201).json({
      message: 'Rol creado correctamente.',
      role: { ...role, permissions },
    });
  } catch (error) {
    console.error('createRole:', error);
    return res.status(500).json({ message: 'Error al crear el rol.' });
  }
}

/** PUT /api/roles/:id */
async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permissionIds } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({ message: 'El nombre del rol es obligatorio.' });
    }

    const db = await getDb();
    const current = await db.get('SELECT id FROM roles WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }

    const duplicate = await db.get(
      'SELECT id FROM roles WHERE nombre = ? AND id != ?',
      [nombre.trim(), id]
    );
    if (duplicate) {
      return res.status(409).json({ message: 'Ya existe un rol con ese nombre.' });
    }

    await db.run(`UPDATE roles SET nombre = ?, descripcion = ? WHERE id = ?`, [
      nombre.trim(),
      descripcion?.trim() || null,
      id,
    ]);

    if (Array.isArray(permissionIds)) {
      await syncRolePermissions(db, Number(id), permissionIds);
    }

    const role = await db.get('SELECT id, nombre, descripcion FROM roles WHERE id = ?', [id]);
    const permissions = await getPermissionsForRole(db, id);

    return res.json({
      message: 'Rol actualizado correctamente.',
      role: { ...role, permissions },
    });
  } catch (error) {
    console.error('updateRole:', error);
    return res.status(500).json({ message: 'Error al actualizar el rol.' });
  }
}

module.exports = { listRoles, createRole, updateRole };
