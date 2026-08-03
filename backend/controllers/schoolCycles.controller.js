const { getDb } = require('../config/database');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateCycle(body) {
  const nombre = String(body.nombre || '').trim();
  const fechaInicio = String(body.fecha_inicio || '').trim();
  const fechaFin = String(body.fecha_fin || '').trim();
  const errors = {};
  if (!nombre) errors.nombre = 'El nombre es obligatorio.';
  if (!DATE_PATTERN.test(fechaInicio)) errors.fecha_inicio = 'Usa el formato YYYY-MM-DD.';
  if (!DATE_PATTERN.test(fechaFin)) errors.fecha_fin = 'Usa el formato YYYY-MM-DD.';
  if (!errors.fecha_inicio && !errors.fecha_fin && fechaFin < fechaInicio) {
    errors.fecha_fin = 'La fecha final debe ser posterior a la inicial.';
  }
  return { errors, values: { nombre, fecha_inicio: fechaInicio, fecha_fin: fechaFin } };
}

async function listSchoolCycles(_req, res) {
  try {
    const db = await getDb();
    const cycles = await db.all(
      `SELECT id, nombre, fecha_inicio, fecha_fin, is_active
       FROM school_cycles ORDER BY fecha_inicio DESC`
    );
    const periods = await db.all(
      `SELECT id, school_cycle_id, nombre, numero, fecha_inicio, fecha_fin, ponderacion
       FROM academic_periods ORDER BY school_cycle_id DESC, numero ASC`
    );
    return res.json({
      cycles: cycles.map((cycle) => ({
        ...cycle,
        is_active: Boolean(cycle.is_active),
        periods: periods.filter((period) => period.school_cycle_id === cycle.id),
      })),
    });
  } catch (error) {
    console.error('listSchoolCycles:', error);
    return res.status(500).json({ message: 'Error al listar ciclos escolares.' });
  }
}

async function createSchoolCycle(req, res) {
  try {
    const validation = validateCycle(req.body);
    if (Object.keys(validation.errors).length) {
      return res.status(400).json({ message: 'Datos de ciclo inválidos.', errors: validation.errors });
    }
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO school_cycles (nombre, fecha_inicio, fecha_fin, is_active)
       VALUES (?, ?, ?, ?)`,
      [
        validation.values.nombre,
        validation.values.fecha_inicio,
        validation.values.fecha_fin,
        req.body.is_active === false ? 0 : 1,
      ]
    );
    const cycle = await db.get('SELECT * FROM school_cycles WHERE id = ?', [result.lastID]);
    return res.status(201).json({ message: 'Ciclo escolar creado.', cycle });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'Ya existe un ciclo con ese nombre.' });
    }
    console.error('createSchoolCycle:', error);
    return res.status(500).json({ message: 'Error al crear el ciclo escolar.' });
  }
}

async function updateSchoolCycle(req, res) {
  try {
    const validation = validateCycle(req.body);
    if (Object.keys(validation.errors).length) {
      return res.status(400).json({ message: 'Datos de ciclo inválidos.', errors: validation.errors });
    }
    const db = await getDb();
    const current = await db.get('SELECT id FROM school_cycles WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ message: 'Ciclo escolar no encontrado.' });
    await db.run(
      `UPDATE school_cycles
       SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, is_active = ? WHERE id = ?`,
      [
        validation.values.nombre,
        validation.values.fecha_inicio,
        validation.values.fecha_fin,
        req.body.is_active === false ? 0 : 1,
        req.params.id,
      ]
    );
    const cycle = await db.get('SELECT * FROM school_cycles WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Ciclo escolar actualizado.', cycle });
  } catch (error) {
    console.error('updateSchoolCycle:', error);
    return res.status(500).json({ message: 'Error al actualizar el ciclo escolar.' });
  }
}

async function createPeriod(req, res) {
  try {
    const cycleId = Number(req.params.id);
    const nombre = String(req.body.nombre || '').trim();
    const numero = Number(req.body.numero);
    const ponderacion = Number(req.body.ponderacion ?? 0);
    const errors = {};
    if (!nombre) errors.nombre = 'El nombre es obligatorio.';
    if (!Number.isInteger(numero) || numero < 1 || numero > 10) errors.numero = 'Número inválido.';
    if (Number.isNaN(ponderacion) || ponderacion < 0) errors.ponderacion = 'Ponderación inválida.';
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Datos de periodo inválidos.', errors });
    }
    const db = await getDb();
    const cycle = await db.get('SELECT id FROM school_cycles WHERE id = ?', [cycleId]);
    if (!cycle) return res.status(404).json({ message: 'Ciclo escolar no encontrado.' });
    const result = await db.run(
      `INSERT INTO academic_periods
        (school_cycle_id, nombre, numero, fecha_inicio, fecha_fin, ponderacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cycleId, nombre, numero, req.body.fecha_inicio || null, req.body.fecha_fin || null, ponderacion]
    );
    const period = await db.get('SELECT * FROM academic_periods WHERE id = ?', [result.lastID]);
    return res.status(201).json({ message: 'Periodo creado.', period });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'Ya existe ese número de periodo en el ciclo.' });
    }
    console.error('createPeriod:', error);
    return res.status(500).json({ message: 'Error al crear el periodo.' });
  }
}

module.exports = { listSchoolCycles, createSchoolCycle, updateSchoolCycle, createPeriod };
