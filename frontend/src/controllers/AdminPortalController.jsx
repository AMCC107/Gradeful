import RoleProtectedRoute from '../routes/RoleProtectedRoute';
import DashboardLayoutController from './DashboardLayoutController';
import { ROLES } from '../models/roles.model';
import { getUserProfile } from '../models/auth.model';
import { ADMIN_NAV_ITEMS } from '../models/navigation.model';

function AdminPortalController() {
  const user = getUserProfile();

  return (
    <RoleProtectedRoute allowedRole={ROLES.ADMIN}>
      <DashboardLayoutController
        user={user}
        navItems={ADMIN_NAV_ITEMS}
        panelLabel="Panel de administración"
      />
    </RoleProtectedRoute>
  );
}

export default AdminPortalController;
