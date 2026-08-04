# Gradeful

Sistema de gestion escolar: control de alumnos, docentes, materias, grupos, calificaciones, asistencia, pagos y reportes, con portales separados para administracion, docentes, padres/tutores y alumnos.


- `backend/` — API REST en Node.js/Express + SQLite.
- `frontend/` — SPA en React 19 + Vite + React Router.

## Puesta en marcha

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completar PORT, JWT_SECRET, JWT_EXPIRES_IN
npm run dev             # nodemon, http://localhost:3000
```

La base de datos SQLite se crea/migra automáticamente al arrancar (`config/database.js`, archivo en `backend/data/gradeful.db`).

### Frontend

```bash
cd frontend
npm install
npm run dev              # Vite, http://localhost:5173
```

El frontend apunta a la API vía `VITE_API_URL` (por defecto `http://localhost:3000`, ver `frontend/src/services/api.client.js`).

## Autenticación y roles

Login: `POST /api/auth/login` con `email`/`password`, devuelve un JWT (`backend/controllers/auth.controller.js`). El frontend lo guarda en `localStorage` (`authToken`) y lo manda como `Authorization: Bearer <token>` en cada request (`api.client.js`).

En el backend, cada router protegido usa el middleware `authenticate` (valida el JWT y carga el usuario) y luego `authorizeRoles(...)` o `checkPermission(...)` (`backend/middleware/auth.middleware.js`) para restringir por rol o por permiso puntual (tabla `role_permissions`).

Roles (`frontend/src/models/roles.model.js` / `backend/utils/access.js`):

| id | rol | portal |
| --- | --- | --- |
| 1 | Admin / Dirección | `/admin` |
| 2 | Padre / tutor | `/padre` |
| 3 | Alumno | `/portal` |
| 4 | Docente | `/profesor` |

En el frontend, `RoleProtectedRoute` (`frontend/src/routes/RoleProtectedRoute.jsx`) redirige si el rol del usuario no corresponde a la sección; `RootRedirect` manda a cada quien a su home según rol.

## Backend — API

Todas las rutas cuelgan de `/api/*` y se registran en `backend/index.js`. Cada archivo en `routes/` delega en un `controllers/*.controller.js` y aplica `authenticate`/`authorizeRoles` a nivel de router o de ruta individual.

| Recurso | Base | Controller | Descripción |
| --- | --- | --- | --- |
| Auth | `/api/auth` | `auth.controller.js` | Login y emisión de JWT |
| Usuarios | `/api/users` | `users.controller.js` | Alta/edición/baja de cuentas de usuario (solo admin) |
| Roles | `/api/roles` | `roles.controller.js` | Catálogo de roles |
| Perfil | `/api/profile` | `profile.controller.js` | Ver/editar el perfil del usuario autenticado |
| Alumnos | `/api/students` | `students.controller.js`, `studentTransfer.controller.js` | CRUD de alumnos, baja, importación y exportación Excel |
| Docentes | `/api/teachers` | `teachers.controller.js` | CRUD de docentes y baja |
| Materias | `/api/subjects` | `subjects.controller.js` | CRUD de materias (admin) |
| Cursos | `/api/courses` | `courses.controller.js` | CRUD de cursos/grados (admin) |
| Grupos | `/api/groups` | `groups.controller.js` | CRUD de grupos, alumnos por grupo |
| Inscripciones | `/api/enrollments` | `enrollments.controller.js` | Alta/baja de inscripción de alumno a grupo |
| Ciclos escolares | `/api/school-cycles` | `schoolCycles.controller.js` | Ciclos y periodos académicos (admin) |
| Actividades | `/api/activities` | `activities.controller.js` | Tareas/actividades por grupo; pendientes por alumno |
| Calificaciones | `/api/grades` | `grades.controller.js` | Captura por grupo (docente/admin) y consulta por alumno |
| Asistencia | `/api/attendance` | `attendance.controller.js` | Pase de lista por grupo, consulta por alumno, justificantes (con adjunto) |
| Pagos | `/api/payments` | `payments.controller.js` | Conceptos de pago, cargos, estado de cuenta, registro de pagos y comprobantes |
| Padres | `/api/parents` | `parents.controller.js` | Vínculo padre–alumno, hijos de un padre |
| Reportes | `/api/reports` | `reports.controller.js` | Configuración institucional, dashboard admin, boleta PDF, exportación Excel/PDF |

Middleware transversal: CORS, JSON body (`express.json`, límite 2mb), manejador de errores para Multer/uploads. Endpoints de diagnóstico sin auth: `GET /api/status` y `GET /api/health` (chequea la BD).

## Frontend — arquitectura y pantallas

El frontend sigue un patrón tipo MVC por página:

- `views/` — componentes de presentación puros (las "pantallas").
- `controllers/` — un controller por portal (`AdminPortalController`, `TeacherPortalController`, `ParentPortalController`, `StudentPortalController`, `LoginPageController`) más hooks en `controllers/hooks/` que concentran el estado y la lógica de cada pantalla (ej. `useStudentManagement`, `useTeacherActivities`).
- `services/` — un archivo por recurso, uno a uno con los endpoints del backend (`students.service.js`, `grades.service.js`, etc.), todos usando `api.client.js` para el fetch autenticado.
- `models/` — constantes de dominio (roles, navegación).
- `routes/` — `RoleProtectedRoute` y `RootRedirect`.
- `app/router.jsx` — árbol de rutas de React Router.
- `contexts/ParentStudentContext.jsx` — alumno seleccionado cuando un padre tiene varios hijos.

### Portal Admin (`/admin`)

| Ruta | Vista | Función |
| --- | --- | --- |
| `resumen` | `AdminDashboardView` | KPIs generales (alumnos, adeudos, asistencia) |
| `gestion-alumnos` | `StudentManagement` | Alta/edición/baja, importación y exportación Excel de alumnos, wizard de inscripción (`StudentEnrollmentWizard`), perfil 360 (`StudentProfile360`) |
| `gestion-profesores` | `TeacherManagement` | CRUD de docentes |
| `gestion-materias` | `SubjectManagement` | CRUD de materias |
| `gestion-cursos` | `CourseManagement` | CRUD de cursos/grados |
| `gestion-grupos` | `GroupManagement` | CRUD de grupos y asignación de docente/alumnos |
| `inscripciones` | `EnrollmentManagement` | Inscribir/dar de baja alumnos en grupos |
| `gestion-usuarios` | `UserManagement` | CRUD de cuentas de usuario |
| `gestion-roles` | `RoleManagement` | Catálogo de roles |
| `conceptos-pago` | `PaymentConceptsView` | Catálogo de conceptos de pago (colegiatura, inscripción, etc.) |
| `tesoreria` | `TreasuryView` | Cargos, pagos y estado de cuenta por alumno |
| `perfil` | `UserProfile` (compartida) | Perfil del usuario admin |
| `registro-notas`, `tramites`, `configuracion` | `PortalPlaceholderView` | Pendientes de implementar |

### Portal Docente (`/profesor`)

| Ruta | Vista | Función |
| --- | --- | --- |
| `actividades` | `TeacherActivitiesView` | Crear/editar actividades de sus grupos |
| `asistencia` | `TeacherAttendanceView` | Pase de lista por grupo y fecha |
| `calificaciones` | `TeacherGradesView` | Captura de calificaciones por grupo |
| `perfil` | `UserProfile` (compartida) | Perfil del docente |

### Portal Alumno (`/portal`)

| Ruta | Vista | Función |
| --- | --- | --- |
| `resumen` | `StudentSummaryView` | Resumen general del alumno |
| `mi-informacion` | `StudentInfoView` | Datos personales del alumno |
| `actividades` | `StudentPendingActivitiesView` | Actividades pendientes |
| `calificaciones` | `StudentGradesView` | Calificaciones y descarga de boleta PDF |
| `pagos` | `StudentPaymentsView` | Estado de cuenta y comprobantes de pago |
| `tramites` | `PortalPlaceholderView` | Pendiente de implementar |

### Portal Padre/Tutor (`/padre`)

| Ruta | Vista | Función |
| --- | --- | --- |
| `calificaciones` | `ParentGradesView` | Calificaciones del hijo seleccionado (`ViewingStudentBanner` cuando hay varios) |
| `pagos` | `ParentPaymentsView` | Estado de cuenta y pagos del hijo seleccionado |
| `perfil` | `UserProfile` (compartida) | Perfil del padre/tutor |

### Vistas compartidas

- `views/shared/UserProfile.jsx` — perfil reusado en los 4 portales.
- `views/shared/BoletaPDF.jsx` — plantilla/visor de boleta.
- `views/shared/sidebar/` — navegación lateral (`SidebarView`, `SidebarNavView`).
- `views/layout/DashboardLayoutView.jsx` — layout común (sidebar + contenido) que envuelve cada portal.
- `views/auth/LoginView.jsx` — pantalla de login.

## Servicios del frontend (capa de datos)

Cada servicio en `frontend/src/services/` expone funciones `async` que llaman a un recurso del backend vía `fetch` + `api.client.js` (headers de auth, parseo de errores, query strings):

| Servicio | Endpoints que consume |
| --- | --- |
| `auth.service.js` | `POST /api/auth/login` |
| `profile.service.js` | `GET/PUT /api/profile` |
| `users.service.js` | CRUD + baja de `/api/users` |
| `roles.service.js` | CRUD de `/api/roles` |
| `students.service.js` | CRUD, baja, import/export de `/api/students` |
| `teachers.service.js` | CRUD y baja de `/api/teachers` |
| `subjects.service.js` | CRUD de `/api/subjects` |
| `courses.service.js` | CRUD de `/api/courses` |
| `groups.service.js` | CRUD de `/api/groups` y alumnos por grupo |
| `enrollments.service.js` | Alta/baja de `/api/enrollments` |
| `activities.service.js` | CRUD de `/api/activities` y pendientes por alumno |
| `grades.service.js` | Captura/consulta de `/api/grades` y descarga de boleta |
| `attendance.service.js` | Pase de lista y justificantes de `/api/attendance` |
| `payments.service.js` | Conceptos, cargos, estado de cuenta y comprobantes de `/api/payments` |
| `parents.service.js` | Hijos vinculados vía `/api/parents` |
| `reports.service.js` | Resumen del dashboard admin vía `/api/reports` |
| `api.client.js` | Base común: `API_URL`, `authHeaders`, `parseResponse`, `buildQuery` |
