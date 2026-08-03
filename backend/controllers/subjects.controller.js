const { getDb } = require('../config/database');
const { validateSubjectPayload } = require('../utils/academicValidation');

function mapSubject(row) {
  if (!row) return null;
  return {
    id: row.id,
    clave: row.clave,
    nombre: row.nombre,
    descripcion: row.descripcion,
  };
}

function validationError(res, errors, message = 'Datos de materia inválidos.') {
  return res.status(400).json({ message, errors });
}

/** GET /api/subjects */
async function listSubjects(req, res) {
  try {
    const { search } = req.query;
    const conditions = [];
    const params = [];

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push('(clave LIKE ? OR nombre LIKE ? OR descripcion LIKE ?)');
      params.push(term, term, term);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = await getDb();
    const rows = await db.all(
      `SELECT id, clave, nombre, descripcion FROM subjects ${whereClause} ORDER BY nombre ASC`,
      params
    );

    return res.json({ subjects: rows.map(mapSubject) });
  } catch (error) {
    console.error('listSubjects:', error);
    return res.status(500).json({ message: 'Error al listar materias.' });
  }
}

/** POST /api/subjects */
async function createSubject(req, res) {
  try {
    const validation = validateSubjectPayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const { clave, nombre, descripcion } = validation.values;
    const db = await getDb();

    const existing = await db.get('SELECT id FROM subjects WHERE nombre = ?', [nombre]);
    if (existing) {
      return validationError(res, {
        nombre: 'Ya existe una materia con ese nombre exacto.',
      });
    }

    const result = await db.run(
      `INSERT INTO subjects (clave, nombre, descripcion) VALUES (?, ?, ?)`,
      [clave, nombre, descripcion]
    );

    const row = await db.get('SELECT id, clave, nombre, descripcion FROM subjects WHERE id = ?', [
      result.lastID,
    ]);

    return res.status(201).json({
      message: 'Materia creada correctamente.',
      subject: mapSubject(row),
    });
  } catch (error) {
    console.error('createSubject:', error);
    return res.status(500).json({ message: 'Error al crear la materia.' });
  }
}

/** PUT /api/subjects/:id */
async function updateSubject(req, res) {
  try {
    const { id } = req.params;
    const validation = validateSubjectPayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const db = await getDb();
    const current = await db.get('SELECT id FROM subjects WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Materia no encontrada.' });
    }

    const { clave, nombre, descripcion } = validation.values;
    const duplicate = await db.get(
      'SELECT id FROM subjects WHERE nombre = ? AND id != ?',
      [nombre, id]
    );
    if (duplicate) {
      return validationError(res, {
        nombre: 'Ya existe una materia con ese nombre exacto.',
      });
    }

    await db.run(`UPDATE subjects SET clave = ?, nombre = ?, descripcion = ? WHERE id = ?`, [
      clave,
      nombre,
      descripcion,
      id,
    ]);

    const row = await db.get('SELECT id, clave, nombre, descripcion FROM subjects WHERE id = ?', [
      id,
    ]);

    return res.json({
      message: 'Materia actualizada correctamente.',
      subject: mapSubject(row),
    });
  } catch (error) {
    console.error('updateSubject:', error);
    return res.status(500).json({ message: 'Error al actualizar la materia.' });
  }
}

/** DELETE /api/subjects/:id */
async function deleteSubject(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id FROM subjects WHERE id = ?', [id]);

    if (!current) {
      return res.status(404).json({ message: 'Materia no encontrada.' });
    }

    await db.run('DELETE FROM subjects WHERE id = ?', [id]);

    return res.json({ message: 'Materia eliminada correctamente.' });
  } catch (error) {
    console.error('deleteSubject:', error);
    return res.status(500).json({ message: 'Error al eliminar la materia.' });
  }
}

module.exports = {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
