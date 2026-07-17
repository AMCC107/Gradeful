import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPageController from '../controllers/LoginPageController';
import StudentPortalController from '../controllers/StudentPortalController';
import AdminPortalController from '../controllers/AdminPortalController';
import ParentPortalController from '../controllers/ParentPortalController';
import TeacherPortalController from '../controllers/TeacherPortalController';
import RootRedirect from '../routes/RootRedirect';
import PortalPlaceholderView from '../views/portal/PortalPlaceholderView';
import UserManagement from '../views/admin/UserManagement';
import RoleManagement from '../views/admin/RoleManagement';
import StudentManagement from '../views/admin/StudentManagement';
import TeacherManagement from '../views/admin/TeacherManagement';
import SubjectManagement from '../views/admin/SubjectManagement';
import CourseManagement from '../views/admin/CourseManagement';
import GroupManagement from '../views/admin/GroupManagement';
import EnrollmentManagement from '../views/admin/EnrollmentManagement';
import TeacherActivitiesView from '../views/teacher/TeacherActivitiesView';
import StudentPendingActivitiesView from '../views/portal/student/StudentPendingActivitiesView';
import UserProfile from '../views/shared/UserProfile';

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPageController />} />

      <Route path="/portal" element={<StudentPortalController />}>
        <Route index element={<Navigate to="resumen" replace />} />
        <Route path="resumen" element={<PortalPlaceholderView />} />
        <Route path="mi-informacion" element={<UserProfile />} />
        <Route path="actividades" element={<StudentPendingActivitiesView />} />
        <Route path="calificaciones" element={<PortalPlaceholderView />} />
        <Route path="pagos" element={<PortalPlaceholderView />} />
        <Route path="tramites" element={<PortalPlaceholderView />} />
      </Route>

      <Route path="/padre" element={<ParentPortalController />}>
        <Route index element={<Navigate to="calificaciones" replace />} />
        <Route path="calificaciones" element={<PortalPlaceholderView />} />
        <Route path="pagos" element={<PortalPlaceholderView />} />
        <Route path="perfil" element={<UserProfile />} />
      </Route>

      <Route path="/profesor" element={<TeacherPortalController />}>
        <Route index element={<Navigate to="actividades" replace />} />
        <Route path="actividades" element={<TeacherActivitiesView />} />
        <Route path="perfil" element={<UserProfile />} />
      </Route>

      <Route path="/admin" element={<AdminPortalController />}>
        <Route index element={<Navigate to="gestion-alumnos" replace />} />
        <Route path="resumen" element={<PortalPlaceholderView />} />
        <Route path="gestion-alumnos" element={<StudentManagement />} />
        <Route path="gestion-profesores" element={<TeacherManagement />} />
        <Route path="gestion-materias" element={<SubjectManagement />} />
        <Route path="gestion-cursos" element={<CourseManagement />} />
        <Route path="gestion-grupos" element={<GroupManagement />} />
        <Route path="inscripciones" element={<EnrollmentManagement />} />
        <Route path="gestion-usuarios" element={<UserManagement />} />
        <Route path="gestion-roles" element={<RoleManagement />} />
        <Route path="registro-notas" element={<PortalPlaceholderView />} />
        <Route path="tesoreria" element={<PortalPlaceholderView />} />
        <Route path="tramites" element={<PortalPlaceholderView />} />
        <Route path="perfil" element={<UserProfile />} />
        <Route path="configuracion" element={<PortalPlaceholderView />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default AppRouter;
