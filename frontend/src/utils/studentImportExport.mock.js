/**
 * Utilidades mock de importación/exportación (CSV/Excel).
 * Preparadas para reemplazarse por llamadas reales al backend.
 */

export function mockExportStudentsExcel(students = []) {
  const rows = students.map((s) => ({
    id: s.id,
    matricula: s.matricula,
    nombre: s.nombre,
    correo: s.correo,
    activo: s.is_active ? 'Sí' : 'No',
  }));

  console.log('[Export Excel] Simulación de descarga de alumnos:', rows);
  window.alert(
    `Exportación a Excel simulada.\n${rows.length} alumno(s) listos para descargar.\n(Revisa la consola para el payload mock.)`,
  );
}

export function mockExportStudentsPDF(students = []) {
  console.log('[Export PDF] Simulación de reporte de alumnos:', students.length);
  window.alert(
    `Exportación a PDF simulada.\nSe generaría un reporte con ${students.length} alumno(s).\n(Pendiente de plantilla de servidor.)`,
  );
}

export function mockImportStudentsFile(file) {
  if (!file) return;

  console.log('[Import CSV/Excel] Archivo recibido:', {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  window.alert(
    `Importación simulada de "${file.name}".\nEl archivo se enviaría al backend para validación y alta masiva.`,
  );
}
