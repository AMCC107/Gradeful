const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateFixtures() {
  const directory = path.join(__dirname, 'fixtures');
  fs.mkdirSync(directory, { recursive: true });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Alumnos');
  sheet.addRow(['nombre', 'correo', 'matricula', 'contraseña']);
  sheet.addRow(['Alumno Importado', 'importado@gradeful.edu', 'EST-IMP-001', 'Importado123!']);
  await workbook.xlsx.writeFile(path.join(directory, 'alumnos.xlsx'));
}

if (require.main === module) {
  generateFixtures().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { generateFixtures };
