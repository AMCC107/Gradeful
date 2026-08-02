import RoleProtectedRoute from '../routes/RoleProtectedRoute';
import DashboardLayoutController from './DashboardLayoutController';
import { ROLES } from '../models/roles.model';
import { getUserProfile } from '../models/auth.model';
import { PADRE_NAV_ITEMS } from '../models/navigation.model';
import { ParentStudentProvider, useParentStudent } from '../contexts/ParentStudentContext';
import { StudentSelector } from '../components/ui';

function ParentDashboardShell({ user }) {
  const { students, selectedStudentId, setSelectedStudentId } = useParentStudent();

  return (
    <DashboardLayoutController
      user={user}
      navItems={PADRE_NAV_ITEMS}
      panelLabel="Portal de padres"
      headerExtra={(
        <StudentSelector
          students={students}
          selectedId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />
      )}
    />
  );
}

function ParentPortalController() {
  const user = getUserProfile();

  return (
    <RoleProtectedRoute allowedRole={ROLES.PADRE}>
      <ParentStudentProvider>
        <ParentDashboardShell user={user} />
      </ParentStudentProvider>
    </RoleProtectedRoute>
  );
}

export default ParentPortalController;
