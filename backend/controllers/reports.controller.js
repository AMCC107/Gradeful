const fs = require('fs');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { getDb } = require('../config/database');
const { canAccessStudent } = require('../utils/access');
const { buildStudentReport } = require('./grades.controller');

async function debtorsReport(db) {
  return db.all(
    `SELECT s.id AS student_id, s.matricula, u.nombre AS alumno,
            COUNT(sc.id) AS cargos_pendientes,
            ROUND(SUM(sc.monto - COALESCE(p.paid, 0)), 2) AS adeudo,
            SUM(CASE WHEN sc.fecha_vencimiento < date('now') THEN 1 ELSE 0 END) AS vencidos
     FROM student_charges sc
     INNER JOIN students s ON s.id = sc.student_id
     INNER JOIN users u ON u.id = s.user_id
     LEFT JOIN (
       SELECT charge_id, SUM(monto) AS paid FROM payments
       WHERE estado = 'confirmado' GROUP BY charge_id
     ) p ON p.charge_id = sc.id
     WHERE sc.estado NOT IN ('pagado', 'cancelado')
       AND sc.monto > COALESCE(p.paid, 0)
     GROUP BY s.id ORDER BY adeudo DESC`
  );
}

async function groupAveragesReport(db, cycleId) {
  return db.all(
    `SELECT g.id AS group_id, c.nombre AS grado, c.nivel, g.nombre AS grupo,
            g.turno, sub.nombre AS materia,
            ROUND(AVG(gr.calificacion), 2) AS promedio,
            COUNT(DISTINCT gr.student_id) AS alumnos_evaluados
     FROM groups g
     INNER JOIN courses c ON c.id = g.course_id
     INNER JOIN subjects sub ON sub.id = g.subject_id
     LEFT JOIN grades gr ON gr.group_id = g.id
     LEFT JOIN academic_periods ap ON ap.id = gr.period_id
     WHERE (? IS NULL OR ap.school_cycle_id = ? OR gr.id IS NULL)
     GROUP BY g.id ORDER BY c.nivel, c.nombre, g.nombre, sub.nombre`,
    [cycleId || null, cycleId || null]
  );
}

async function attendanceReport(db, from, to) {
  return db.all(
    `SELECT g.id AS group_id, c.nombre AS grado, g.nombre AS grupo, g.turno,
            sub.nombre AS materia, COUNT(ar.id) AS registros,
            SUM(CASE WHEN ar.estado = 'presente' THEN 1 ELSE 0 END) AS presentes,
            SUM(CASE WHEN ar.estado = 'ausente' THEN 1 ELSE 0 END) AS ausentes,
            SUM(CASE WHEN ar.estado = 'retardo' THEN 1 ELSE 0 END) AS retardos,
            ROUND(100.0 * SUM(CASE WHEN ar.estado = 'presente' THEN 1 ELSE 0 END) /
              NULLIF(COUNT(ar.id), 0), 2) AS porcentaje_asistencia
     FROM groups g
     INNER JOIN courses c ON c.id = g.course_id
     INNER JOIN subjects sub ON sub.id = g.subject_id
     LEFT JOIN attendance_records ar ON ar.group_id = g.id
       AND (? IS NULL OR ar.fecha >= ?) AND (? IS NULL OR ar.fecha <= ?)
     GROUP BY g.id ORDER BY c.nombre, g.nombre, sub.nombre`,
    [from || null, from || null, to || null, to || null]
  );
}

async function getReportRows(db, type, query) {
  if (type === 'students') {
    return db.all(
      `SELECT s.matricula, u.nombre AS alumno, u.correo,
              CASE WHEN s.is_active = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
       FROM students s INNER JOIN users u ON u.id = s.user_id ORDER BY u.nombre`
    );
  }
  if (type === 'debtors') return debtorsReport(db);
  if (type === 'group-averages') return groupAveragesReport(db, query.school_cycle_id);
  if (type === 'attendance') return attendanceReport(db, query.fecha_desde, query.fecha_hasta);
  return null;
}

async function dashboardSummary(_req, res) {
  try {
    const db = await getDb();
    const summary = await db.get(
      `SELECT
        (SELECT COUNT(*) FROM students WHERE is_active = 1) AS active_students,
        (SELECT COALESCE(SUM(monto), 0) FROM payments
          WHERE estado = 'confirmado' AND strftime('%Y-%m', fecha_pago) = strftime('%Y-%m', 'now')) AS monthly_income,
        (SELECT COUNT(DISTINCT sc.student_id) FROM student_charges sc
          LEFT JOIN (SELECT charge_id, SUM(monto) AS paid FROM payments WHERE estado = 'confirmado' GROUP BY charge_id) p ON p.charge_id = sc.id
          WHERE sc.estado NOT IN ('pagado', 'cancelado') AND sc.fecha_vencimiento < date('now') AND sc.monto > COALESCE(p.paid, 0)) AS overdue_students,
        (SELECT ROUND(AVG(calificacion), 2) FROM grades) AS average_grade`
    );
    const attendance = await db.all(
      `SELECT strftime('%w', fecha) AS weekday,
              ROUND(100.0 * SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS percentage
       FROM attendance_records
       WHERE fecha >= date('now', '-6 days')
       GROUP BY strftime('%w', fecha) ORDER BY weekday`
    );
    const totalStudents = Number(summary.active_students) || 0;
    return res.json({
      summary: {
        ...summary,
        delinquency_rate: totalStudents
          ? Number(((Number(summary.overdue_students) / totalStudents) * 100).toFixed(1))
          : 0,
      },
      attendance,
    });
  } catch (error) {
    console.error('dashboardSummary:', error);
    return res.status(500).json({ message: 'Error al generar indicadores.' });
  }
}

async function listReport(req, res) {
  try {
    const db = await getDb();
    const rows = await getReportRows(db, req.params.type, req.query);
    if (!rows) return res.status(404).json({ message: 'Tipo de reporte no soportado.' });
    return res.json({ type: req.params.type, rows });
  } catch (error) {
    console.error('listReport:', error);
    return res.status(500).json({ message: 'Error al generar el reporte.' });
  }
}

async function exportReportExcel(req, res) {
  try {
    const db = await getDb();
    const rows = await getReportRows(db, req.params.type, req.query);
    if (!rows) return res.status(404).json({ message: 'Tipo de reporte no soportado.' });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte');
    if (rows.length) {
      sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: 22 }));
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true };
      sheet.autoFilter = { from: 'A1', to: `${sheet.getColumn(sheet.columnCount).letter}1` };
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.type}.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error('exportReportExcel:', error);
    return res.status(500).json({ message: 'Error al exportar el reporte.' });
  }
}

function sendPdfTable(res, title, rows, filename) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.fontSize(18).text(title);
  doc.moveDown();
  if (!rows.length) doc.fontSize(11).text('Sin datos para los filtros seleccionados.');
  rows.forEach((row, index) => {
    if (doc.y > 530) doc.addPage();
    doc.fontSize(9).fillColor(index % 2 ? '#334155' : '#0f172a').text(
      Object.entries(row).map(([key, value]) => `${key}: ${value ?? '—'}`).join('   |   '),
      { width: 760 }
    );
    doc.moveDown(0.4);
  });
  doc.end();
}

async function exportReportPdf(req, res) {
  try {
    const db = await getDb();
    const rows = await getReportRows(db, req.params.type, req.query);
    if (!rows) return res.status(404).json({ message: 'Tipo de reporte no soportado.' });
    return sendPdfTable(res, `Reporte: ${req.params.type}`, rows, `${req.params.type}.pdf`);
  } catch (error) {
    console.error('exportReportPdf:', error);
    return res.status(500).json({ message: 'Error al exportar el reporte.' });
  }
}

async function reportCardPdf(req, res) {
  try {
    const studentId = Number(req.params.studentId);
    const db = await getDb();
    if (!(await canAccessStudent(db, req.user, studentId))) {
      return res.status(403).json({ message: 'No tienes acceso a esta boleta.' });
    }
    const report = await buildStudentReport(db, studentId, req.query.school_cycle_id);
    if (!report) return res.status(404).json({ message: 'Alumno no encontrado.' });
    const settings = await db.get('SELECT * FROM institutional_settings WHERE id = 1');
    const doc = new PDFDocument({ margin: 45, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="boleta-${report.student.matricula}.pdf"`);
    doc.pipe(res);
    if (settings?.logo_path && fs.existsSync(settings.logo_path)) {
      doc.image(settings.logo_path, 45, 35, { fit: [70, 70] });
    }
    doc.fontSize(20).text(settings?.nombre_institucion || 'Gradeful', { align: 'center' });
    doc.fontSize(9).fillColor('#475569').text(settings?.direccion || '', { align: 'center' });
    doc.moveDown(2);
    doc.fillColor('#0f172a').fontSize(16).text('Boleta de calificaciones', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Alumno: ${report.student.nombre}`);
    doc.text(`Matrícula: ${report.student.matricula}`);
    doc.text(`Ciclo: ${report.cycle?.nombre || '—'}`);
    doc.text(`Grado/curso: ${report.program || '—'}`);
    doc.moveDown();
    report.grades.forEach((grade) => {
      doc.fontSize(10).fillColor('#0f172a').text(
        `${grade.code}  ${grade.subject}  |  P1: ${grade.p1 ?? '—'}  P2: ${grade.p2 ?? '—'}  P3: ${grade.p3 ?? '—'}  Final: ${grade.final ?? '—'}  ${grade.status}`
      );
      doc.moveDown(0.45);
    });
    doc.moveDown().fontSize(13).text(`Promedio general: ${report.average ?? '—'}`, { align: 'right' });
    doc.fontSize(8).fillColor('#64748b').text(settings?.pie_boleta || '', 45, 780, { align: 'center' });
    doc.end();
  } catch (error) {
    console.error('reportCardPdf:', error);
    return res.status(500).json({ message: 'Error al generar la boleta.' });
  }
}

async function getInstitutionSettings(_req, res) {
  try {
    const db = await getDb();
    return res.json({ settings: await db.get('SELECT * FROM institutional_settings WHERE id = 1') });
  } catch (error) {
    console.error('getInstitutionSettings:', error);
    return res.status(500).json({ message: 'Error al consultar configuración institucional.' });
  }
}

async function updateInstitutionSettings(req, res) {
  try {
    const db = await getDb();
    const current = await db.get('SELECT * FROM institutional_settings WHERE id = 1');
    await db.run(
      `UPDATE institutional_settings SET
        nombre_institucion = ?, logo_path = ?, direccion = ?, telefono = ?, correo = ?, pie_boleta = ?
       WHERE id = 1`,
      [
        req.body.nombre_institucion ?? current.nombre_institucion,
        req.body.logo_path ?? current.logo_path,
        req.body.direccion ?? current.direccion,
        req.body.telefono ?? current.telefono,
        req.body.correo ?? current.correo,
        req.body.pie_boleta ?? current.pie_boleta,
      ]
    );
    return getInstitutionSettings(req, res);
  } catch (error) {
    console.error('updateInstitutionSettings:', error);
    return res.status(500).json({ message: 'Error al actualizar configuración institucional.' });
  }
}

module.exports = {
  listReport,
  exportReportExcel,
  exportReportPdf,
  reportCardPdf,
  getInstitutionSettings,
  updateInstitutionSettings,
  dashboardSummary,
};
