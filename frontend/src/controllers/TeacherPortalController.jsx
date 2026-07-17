import RoleProtectedRoute from '../routes/RoleProtectedRoute';
import DashboardLayoutController from './DashboardLayoutController';
import { ROLES } from '../models/roles.model';
import { getUserProfile } from '../models/auth.model';
import { TEACHER_NAV_ITEMS } from '../models/navigation.model';

function TeacherPortalController() {
  const user = getUserProfile();

  return (
    <RoleProtectedRoute allowedRole={ROLES.TEACHER}>
      <DashboardLayoutController
        user={user}
        navItems={TEACHER_NAV_ITEMS}
        panelLabel="Portal docente"
      />
    </RoleProtectedRoute>
  );
}

export default TeacherPortalController;
