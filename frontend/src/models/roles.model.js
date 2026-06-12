export const ROLES = {
  ADMIN: 1,
  DIRECTOR: 1,   // alias — Director = Admin role
  STUDENT: 3,
  PADRE: 2,      // Padre de familia
};

export function getHomePathByRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/gestion-alumnos';
    case ROLES.PADRE:
      return '/padre/calificaciones';
    case ROLES.STUDENT:
      return '/portal/resumen';
    default:
      return '/login';
  }
}

export function isPathAllowedForRole(path, role) {
  if (role === ROLES.ADMIN)    return path.startsWith('/admin');
  if (role === ROLES.PADRE)    return path.startsWith('/padre');
  if (role === ROLES.STUDENT)  return path.startsWith('/portal');
  return false;
}
