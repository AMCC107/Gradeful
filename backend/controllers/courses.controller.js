const { getDb } = require('../config/database');
const { validateCoursePayload } = require('../utils/academicValidation');

function mapCourse(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    nivel: row.nivel,
  };
}

function validationError(res, errors, message = 'Datos de curso inválidos.') {
  return res.status(400).json({ message, errors });
}

/** GET /api/courses */
async function listCourses(req, res) {
  try {
    const { search } = req.query;
    const conditions = [];
    const params = [];

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push('(nombre LIKE ? OR nivel LIKE ?)');
      params.push(term, term);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = await getDb();
    const rows = await db.all(
      `SELECT id, nombre, nivel FROM courses ${whereClause} ORDER BY nivel ASC, nombre ASC`,
      params
    );

    return res.json({ courses: rows.map(mapCourse) });
  } catch (error) {
    console.error('listCourses:', error);
    return res.status(500).json({ message: 'Error al listar cursos.' });
  }
}

/** POST /api/courses */
async function createCourse(req, res) {
  try {
    const validation = validateCoursePayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const { nombre, nivel } = validation.values;
    const db = await getDb();

    const existing = await db.get(
      'SELECT id FROM courses WHERE nombre = ? AND nivel = ?',
      [nombre, nivel]
    );
    if (existing) {
      return validationError(res, {
        nombre: 'Ya existe un curso con ese nombre y nivel.',
      });
    }

    const result = await db.run(
      `INSERT INTO courses (nombre, nivel) VALUES (?, ?)`,
      [nombre, nivel]
    );

    const row = await db.get('SELECT id, nombre, nivel FROM courses WHERE id = ?', [
      result.lastID,
    ]);

    return res.status(201).json({
      message: 'Curso creado correctamente.',
      course: mapCourse(row),
    });
  } catch (error) {
    console.error('createCourse:', error);
    return res.status(500).json({ message: 'Error al crear el curso.' });
  }
}

/** PUT /api/courses/:id */
async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const validation = validateCoursePayload(req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    const db = await getDb();
    const current = await db.get('SELECT id FROM courses WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    const { nombre, nivel } = validation.values;
    const duplicate = await db.get(
      'SELECT id FROM courses WHERE nombre = ? AND nivel = ? AND id != ?',
      [nombre, nivel, id]
    );
    if (duplicate) {
      return validationError(res, {
        nombre: 'Ya existe un curso con ese nombre y nivel.',
      });
    }

    await db.run(`UPDATE courses SET nombre = ?, nivel = ? WHERE id = ?`, [
      nombre,
      nivel,
      id,
    ]);

    const row = await db.get('SELECT id, nombre, nivel FROM courses WHERE id = ?', [id]);

    return res.json({
      message: 'Curso actualizado correctamente.',
      course: mapCourse(row),
    });
  } catch (error) {
    console.error('updateCourse:', error);
    return res.status(500).json({ message: 'Error al actualizar el curso.' });
  }
}

/** DELETE /api/courses/:id */
async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const current = await db.get('SELECT id FROM courses WHERE id = ?', [id]);

    if (!current) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    await db.run('DELETE FROM courses WHERE id = ?', [id]);

    return res.json({ message: 'Curso eliminado correctamente.' });
  } catch (error) {
    console.error('deleteCourse:', error);
    return res.status(500).json({ message: 'Error al eliminar el curso.' });
  }
}

module.exports = {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
