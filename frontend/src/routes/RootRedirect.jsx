import { Navigate } from 'react-router-dom';
import { getHomePathByRole } from '../models/roles.model';
import { getUserRole, isAuthenticated } from '../models/auth.model';

function RootRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomePathByRole(getUserRole())} replace />;
}

export default RootRedirect;
