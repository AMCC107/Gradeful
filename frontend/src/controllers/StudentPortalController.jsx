import RoleProtectedRoute from '../routes/RoleProtectedRoute';
import DashboardLayoutController from './DashboardLayoutController';
import { ROLES } from '../models/roles.model';
import { getUserProfile } from '../models/auth.model';
import { STUDENT_NAV_ITEMS } from '../models/navigation.model';

function StudentPortalController() {
  const user = getUserProfile();

  return (
    <RoleProtectedRoute allowedRole={ROLES.STUDENT}>
      <DashboardLayoutController
        user={user}
        navItems={STUDENT_NAV_ITEMS}
        panelLabel="Portal estudiantil"
      />
    </RoleProtectedRoute>
  );
}

export default StudentPortalController;
