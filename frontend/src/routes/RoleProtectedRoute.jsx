import { Navigate, useLocation } from 'react-router-dom';
import { getHomePathByRole } from '../models/roles.model';
import { getUserRole, isAuthenticated } from '../models/auth.model';

function RoleProtectedRoute({ allowedRole, children }) {
  const location = useLocation();
  const role = getUserRole();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role !== allowedRole) {
    return <Navigate to={getHomePathByRole(role)} replace />;
  }

  return children;
}

export default RoleProtectedRoute;
