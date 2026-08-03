# Cobertura de requerimientos funcionales

## Implementado y persistido

| Requerimiento | Implementación principal |
| --- | --- |
| Inscripción de alumnos | `students`, `enrollments` y wizard/CRUD existente |
| Ciclos, grados, grupos y turnos | `school_cycles`, `academic_periods`, `courses` y columnas `nombre`/`turno` de `groups` |
| Materias y asignación docente | `subjects`, `teachers` y asignación en `groups` |
| Calificaciones parciales y final | `grades`; el promedio final se calcula desde periodos persistidos |
| Asistencia diaria | `attendance_records`, con presente/ausente/retardo por alumno, grupo y fecha |
| Justificación de faltas | `attendance_justifications`, adjunto PDF/JPG/PNG y flujo pendiente/aprobada/rechazada |
| Boletas PDF | PDF generado en servidor con PDFKit y configuración de `institutional_settings` |
| Colegiaturas, inscripción y adicionales | `payment_concepts`, `student_charges`, `payments` y `payment_proofs` |
| Estado de cuenta | Saldo calculado por alumno con estados pagado/adeudo/vencido |
| Portal de padres | Relación `parent_students`; selector, calificaciones y pagos consultados por API |
| Reportes | Adeudos, promedios de grupo y estadísticas de asistencia en JSON, Excel y PDF |
| Importación masiva | Excel real mediante `POST /api/students/import` |
| Exportación | Alumnos y reportes en Excel/PDF |

## Acceso segmentado

- Dirección/administración: acceso institucional completo.
- Docente: sólo grupos asignados; puede capturar calificaciones, asistencias y actividades de esos grupos.
- Padre/tutor: sólo alumnos vinculados en `parent_students`.
- Alumno: sólo su propia boleta, cuenta, asistencia y actividades.

La autorización se verifica en el backend con JWT y consultas de alcance contra la base de datos; no depende únicamente de las rutas protegidas de React.

## Disponibilidad y consistencia

- SQLite opera con WAL, `busy_timeout`, claves foráneas e índices en consultas críticas.
- Las capturas masivas de calificaciones, asistencias, importaciones y pagos usan transacciones.
- `/api/health` comprueba también disponibilidad de la base de datos.
- Para producción con múltiples instancias se recomienda sustituir SQLite por PostgreSQL administrado y colocar archivos adjuntos en almacenamiento de objetos compartido.

## Verificación

- Colección Postman/Newman: 32 solicitudes y 32 aserciones.
- Integridad SQLite: `integrity_check = ok` y cero errores de claves foráneas.
- Build de React/Vite: exitoso.
- Dependencias de producción: cero vulnerabilidades conocidas según `npm audit --omit=dev` al momento de la implementación.
