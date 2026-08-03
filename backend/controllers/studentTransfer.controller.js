const fs = require('fs');
const ExcelJS = require('exceljs');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');

function normalizeHeaders(worksheet) {
  const result = {};
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    const name = String(cell.value || '').trim().toLowerCase();
    result[name] = columnNumber;
  });
  return result;
}

function cellText(row, headers, names) {
  const header = names.find((name) => headers[name]);
  if (!header) return '';
  const value = row.getCell(headers[header]).value;
  if (value && typeof value === 'object' && 'text' in value) return String(value.text).trim();
  return String(value ?? '').trim();
}

async function importStudents(req, res) {
  const db = await getDb();
  let inTransaction = false;
  try {
    if (!req.file) return res.status(400).json({ message: 'Adjunta un archivo Excel.' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return res.status(400).json({ message: 'El archivo no contiene hojas.' });
    const headers = normalizeHeaders(worksheet);
    const required = ['nombre', 'correo', 'matricula'];
    const missing = required.filter((header) => !headers[header] && !(header === 'matricula' && headers['matrícula']));
    if (missing.length) {
      return res.status(400).json({ message: `Faltan columnas: ${missing.join(', ')}.` });
    }
    const results = [];
    await db.exec('BEGIN IMMEDIATE');
    inTransaction = true;
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const nombre = cellText(row, headers, ['nombre']);
      const correo = cellText(row, headers, ['correo', 'email']).toLowerCase();
      const matricula = cellText(row, headers, ['matricula', 'matrícula']);
      const password = cellText(row, headers, ['contraseña', 'contrasena', 'password']) || 'Cambiar123!';
      if (!nombre && !correo && !matricula) continue;
      if (!nombre || !correo.includes('@') || matricula.length < 3) {
        results.push({ row: rowNumber, status: 'error', message: 'Nombre, correo o matrícula inválidos.' });
        continue;
      }
      const duplicate = await db.get(
        `SELECT u.id FROM users u LEFT JOIN students s ON s.user_id = u.id
         WHERE u.correo = ? OR s.matricula = ?`,
        [correo, matricula]
      );
      if (duplicate) {
        results.push({ row: rowNumber, status: 'skipped', message: 'Correo o matrícula ya registrados.' });
        continue;
      }
      const hashed = await bcrypt.hash(password, 10);
      const userResult = await db.run(
        `INSERT INTO users (nombre, correo, contraseña, is_active, role_id)
         VALUES (?, ?, ?, 1, 3)`,
        [nombre, correo, hashed]
      );
      const studentResult = await db.run(
        'INSERT INTO students (user_id, matricula, is_active) VALUES (?, ?, 1)',
        [userResult.lastID, matricula]
      );
      results.push({ row: rowNumber, status: 'created', student_id: studentResult.lastID, matricula });
    }
    await db.exec('COMMIT');
    inTransaction = false;
    return res.status(201).json({
      message: 'Importación finalizada.',
      summary: {
        created: results.filter((item) => item.status === 'created').length,
        skipped: results.filter((item) => item.status === 'skipped').length,
        errors: results.filter((item) => item.status === 'error').length,
      },
      results,
    });
  } catch (error) {
    if (inTransaction) await db.exec('ROLLBACK');
    console.error('importStudents:', error);
    return res.status(500).json({ message: 'Error al importar alumnos.' });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
}

async function exportStudents(_req, res) {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT s.matricula, u.nombre, u.correo,
              CASE WHEN s.is_active = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
       FROM students s INNER JOIN users u ON u.id = s.user_id ORDER BY u.nombre`
    );
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Alumnos');
    sheet.columns = [
      { header: 'Matrícula', key: 'matricula', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 35 },
      { header: 'Correo', key: 'correo', width: 35 },
      { header: 'Estado', key: 'estado', width: 15 },
    ];
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="alumnos.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error('exportStudents:', error);
    return res.status(500).json({ message: 'Error al exportar alumnos.' });
  }
}

module.exports = { importStudents, exportStudents };
