import RoleProtectedRoute from '../routes/RoleProtectedRoute';
import DashboardLayoutController from './DashboardLayoutController';
import { ROLES } from '../models/roles.model';
import { getUserProfile } from '../models/auth.model';
import { PADRE_NAV_ITEMS } from '../models/navigation.model';

function ParentPortalController() {
  const user = getUserProfile();

  return (
    <RoleProtectedRoute allowedRole={ROLES.PADRE}>
      <DashboardLayoutController
        user={user}
        navItems={PADRE_NAV_ITEMS}
        panelLabel="Portal de padres"
      />
    </RoleProtectedRoute>
  );
}

export default ParentPortalController;
