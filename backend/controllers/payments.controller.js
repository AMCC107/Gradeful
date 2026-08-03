const { getDb } = require('../config/database');
const { canAccessStudent } = require('../utils/access');
const path = require('path');
const { UPLOAD_ROOT } = require('../config/upload');

function mapConcept(row) {
  return row ? { ...row, recurrente: Boolean(row.recurrente), is_active: Boolean(row.is_active) } : null;
}

async function listConcepts(_req, res) {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM payment_concepts ORDER BY nombre');
    return res.json({ concepts: rows.map(mapConcept) });
  } catch (error) {
    console.error('listConcepts:', error);
    return res.status(500).json({ message: 'Error al listar conceptos de pago.' });
  }
}

async function createConcept(req, res) {
  try {
    const nombre = String(req.body.nombre || '').trim();
    const tipo = String(req.body.tipo || '').toLowerCase();
    const amount = Number(req.body.monto_base);
    const errors = {};
    if (!nombre) errors.nombre = 'El nombre es obligatorio.';
    if (!['colegiatura', 'inscripcion', 'adicional'].includes(tipo)) errors.tipo = 'Tipo inválido.';
    if (Number.isNaN(amount) || amount < 0) errors.monto_base = 'Monto inválido.';
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Datos de concepto inválidos.', errors });
    }
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO payment_concepts (nombre, tipo, monto_base, recurrente, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [nombre, tipo, amount, req.body.recurrente ? 1 : 0]
    );
    const concept = await db.get('SELECT * FROM payment_concepts WHERE id = ?', [result.lastID]);
    return res.status(201).json({ message: 'Concepto creado.', concept: mapConcept(concept) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'Ya existe un concepto con ese nombre.' });
    }
    console.error('createConcept:', error);
    return res.status(500).json({ message: 'Error al crear el concepto.' });
  }
}

async function updateConcept(req, res) {
  try {
    const db = await getDb();
    const current = await db.get('SELECT * FROM payment_concepts WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ message: 'Concepto no encontrado.' });
    const nombre = String(req.body.nombre ?? current.nombre).trim();
    const tipo = String(req.body.tipo ?? current.tipo).toLowerCase();
    const amount = Number(req.body.monto_base ?? current.monto_base);
    if (!nombre || !['colegiatura', 'inscripcion', 'adicional'].includes(tipo) || amount < 0) {
      return res.status(400).json({ message: 'Datos de concepto inválidos.' });
    }
    await db.run(
      `UPDATE payment_concepts
       SET nombre = ?, tipo = ?, monto_base = ?, recurrente = ?, is_active = ? WHERE id = ?`,
      [
        nombre,
        tipo,
        amount,
        (req.body.recurrente ?? Boolean(current.recurrente)) ? 1 : 0,
        (req.body.is_active ?? Boolean(current.is_active)) ? 1 : 0,
        req.params.id,
      ]
    );
    const concept = await db.get('SELECT * FROM payment_concepts WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Concepto actualizado.', concept: mapConcept(concept) });
  } catch (error) {
    console.error('updateConcept:', error);
    return res.status(500).json({ message: 'Error al actualizar el concepto.' });
  }
}

async function buildAccount(db, studentId) {
  const student = await db.get(
    `SELECT s.id, s.matricula, u.nombre, u.correo
     FROM students s INNER JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    [studentId]
  );
  if (!student) return null;
  const charges = await db.all(
    `SELECT sc.id, sc.student_id, sc.descripcion, sc.monto, sc.fecha_vencimiento,
            sc.estado AS stored_status, pc.nombre AS concept, pc.tipo,
            COALESCE(SUM(CASE WHEN p.estado = 'confirmado' THEN p.monto ELSE 0 END), 0) AS paid_amount
     FROM student_charges sc
     INNER JOIN payment_concepts pc ON pc.id = sc.concept_id
     LEFT JOIN payments p ON p.charge_id = sc.id
     WHERE sc.student_id = ? AND sc.estado != 'cancelado'
     GROUP BY sc.id ORDER BY sc.fecha_vencimiento`,
    [studentId]
  );
  const today = new Date().toISOString().slice(0, 10);
  const normalizedCharges = charges.map((charge) => {
    const balance = Math.max(0, Number(charge.monto) - Number(charge.paid_amount));
    let status = 'adeudo';
    if (balance === 0 || charge.stored_status === 'pagado') status = 'pagado';
    else if (charge.fecha_vencimiento < today) status = 'vencido';
    return { ...charge, balance, status };
  });
  const history = await db.all(
    `SELECT p.id, p.monto, p.fecha_pago, p.metodo, p.referencia, p.estado,
            pc.nombre AS concept
     FROM payments p
     LEFT JOIN student_charges sc ON sc.id = p.charge_id
     LEFT JOIN payment_concepts pc ON pc.id = sc.concept_id
     WHERE p.student_id = ? ORDER BY p.fecha_pago DESC, p.id DESC`,
    [studentId]
  );
  const outstanding = normalizedCharges.filter((charge) => charge.status !== 'pagado');
  return {
    student,
    accountSummary: {
      currentBalance: outstanding.reduce((sum, charge) => sum + charge.balance, 0),
      overdueCount: outstanding.filter((charge) => charge.status === 'vencido').length,
      upcomingCount: outstanding.filter((charge) => charge.status === 'adeudo').length,
    },
    pendingCharges: outstanding.map((charge) => ({
      id: charge.id,
      concept: charge.descripcion || charge.concept,
      amount: charge.balance,
      originalAmount: charge.monto,
      due: charge.fecha_vencimiento,
      status: charge.status,
    })),
    paymentHistory: history.map((payment) => ({
      id: payment.id,
      concept: payment.concept || 'Pago sin cargo asociado',
      amount: payment.monto,
      date: payment.fecha_pago,
      method: payment.metodo,
      reference: payment.referencia,
      status: payment.estado,
    })),
  };
}

async function getAccount(req, res) {
  try {
    const studentId = Number(req.params.studentId);
    const db = await getDb();
    if (!(await canAccessStudent(db, req.user, studentId))) {
      return res.status(403).json({ message: 'No tienes acceso a este estado de cuenta.' });
    }
    const account = await buildAccount(db, studentId);
    if (!account) return res.status(404).json({ message: 'Alumno no encontrado.' });
    return res.json(account);
  } catch (error) {
    console.error('getAccount:', error);
    return res.status(500).json({ message: 'Error al consultar el estado de cuenta.' });
  }
}

async function createCharge(req, res) {
  try {
    const studentId = Number(req.body.student_id);
    const conceptId = Number(req.body.concept_id);
    const dueDate = String(req.body.fecha_vencimiento || '');
    const db = await getDb();
    const concept = await db.get('SELECT * FROM payment_concepts WHERE id = ? AND is_active = 1', [conceptId]);
    const student = await db.get('SELECT id FROM students WHERE id = ? AND is_active = 1', [studentId]);
    const amount = Number(req.body.monto ?? concept?.monto_base);
    if (!student || !concept || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: 'Alumno, concepto, monto o vencimiento inválidos.' });
    }
    const result = await db.run(
      `INSERT INTO student_charges
        (student_id, concept_id, school_cycle_id, descripcion, monto, fecha_vencimiento)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, conceptId, req.body.school_cycle_id || null, req.body.descripcion || null, amount, dueDate]
    );
    return res.status(201).json({ message: 'Cargo creado.', charge_id: result.lastID });
  } catch (error) {
    console.error('createCharge:', error);
    return res.status(500).json({ message: 'Error al crear el cargo.' });
  }
}

async function createPayment(req, res) {
  const db = await getDb();
  let inTransaction = false;
  try {
    const studentId = Number(req.body.student_id);
    const chargeId = req.body.charge_id ? Number(req.body.charge_id) : null;
    const amount = Number(req.body.monto);
    const method = String(req.body.metodo || '').trim();
    const student = await db.get('SELECT id FROM students WHERE id = ?', [studentId]);
    const charge = chargeId
      ? await db.get('SELECT * FROM student_charges WHERE id = ? AND student_id = ?', [chargeId, studentId])
      : null;
    if (!student || (chargeId && !charge) || Number.isNaN(amount) || amount <= 0 || !method) {
      return res.status(400).json({ message: 'Datos de pago inválidos.' });
    }
    await db.exec('BEGIN IMMEDIATE');
    inTransaction = true;
    const result = await db.run(
      `INSERT INTO payments
        (student_id, charge_id, monto, fecha_pago, metodo, referencia, estado, recorded_by_user_id)
       VALUES (?, ?, ?, COALESCE(?, datetime('now')), ?, ?, 'confirmado', ?)`,
      [studentId, chargeId, amount, req.body.fecha_pago || null, method, req.body.referencia || null, req.user.id]
    );
    if (chargeId) {
      const total = await db.get(
        `SELECT COALESCE(SUM(monto), 0) AS paid FROM payments
         WHERE charge_id = ? AND estado = 'confirmado'`,
        [chargeId]
      );
      if (total.paid >= charge.monto) {
        await db.run("UPDATE student_charges SET estado = 'pagado' WHERE id = ?", [chargeId]);
      }
    }
    await db.exec('COMMIT');
    inTransaction = false;
    return res.status(201).json({ message: 'Pago registrado.', payment_id: result.lastID });
  } catch (error) {
    if (inTransaction) await db.exec('ROLLBACK');
    console.error('createPayment:', error);
    return res.status(500).json({ message: 'Error al registrar el pago.' });
  }
}

async function submitPaymentProof(req, res) {
  try {
    const studentId = Number(req.body.student_id);
    if (!req.file || !studentId) {
      return res.status(400).json({ message: 'Alumno y comprobante son obligatorios.' });
    }
    const db = await getDb();
    if (!(await canAccessStudent(db, req.user, studentId))) {
      return res.status(403).json({ message: 'No puedes enviar comprobantes para este alumno.' });
    }
    const chargeId = req.body.charge_id ? Number(req.body.charge_id) : null;
    if (chargeId) {
      const charge = await db.get(
        'SELECT id FROM student_charges WHERE id = ? AND student_id = ?',
        [chargeId, studentId]
      );
      if (!charge) return res.status(400).json({ message: 'El cargo no corresponde al alumno.' });
    }
    const relativePath = path.relative(UPLOAD_ROOT, req.file.path).replaceAll('\\', '/');
    const result = await db.run(
      `INSERT INTO payment_proofs
        (student_id, charge_id, document_path, original_name, mime_type, submitted_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, chargeId, relativePath, req.file.originalname, req.file.mimetype, req.user.id]
    );
    return res.status(201).json({
      message: 'Comprobante enviado. Tesorería lo revisará pronto.',
      proof: { id: result.lastID, estado: 'pendiente' },
    });
  } catch (error) {
    console.error('submitPaymentProof:', error);
    return res.status(500).json({ message: 'Error al enviar el comprobante.' });
  }
}

module.exports = {
  listConcepts,
  createConcept,
  updateConcept,
  getAccount,
  createCharge,
  createPayment,
  buildAccount,
  submitPaymentProof,
};
