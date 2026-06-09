import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPageController from '../controllers/LoginPageController';
import StudentPortalController from '../controllers/StudentPortalController';
import AdminPortalController from '../controllers/AdminPortalController';
import RootRedirect from '../routes/RootRedirect';
import PortalPlaceholderView from '../views/portal/PortalPlaceholderView';

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPageController />} />

      <Route path="/portal" element={<StudentPortalController />}>
        <Route index element={<Navigate to="resumen" replace />} />
        <Route path="resumen" element={<PortalPlaceholderView />} />
        <Route path="mi-informacion" element={<PortalPlaceholderView />} />
        <Route path="calificaciones" element={<PortalPlaceholderView />} />
        <Route path="pagos" element={<PortalPlaceholderView />} />
        <Route path="tramites" element={<PortalPlaceholderView />} />
      </Route>

      <Route path="/admin" element={<AdminPortalController />}>
        <Route index element={<Navigate to="gestion-alumnos" replace />} />
        <Route path="resumen" element={<PortalPlaceholderView />} />
        <Route path="gestion-alumnos" element={<PortalPlaceholderView />} />
        <Route path="registro-notas" element={<PortalPlaceholderView />} />
        <Route path="tesoreria" element={<PortalPlaceholderView />} />
        <Route path="tramites" element={<PortalPlaceholderView />} />
        <Route path="configuracion" element={<PortalPlaceholderView />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default AppRouter;
