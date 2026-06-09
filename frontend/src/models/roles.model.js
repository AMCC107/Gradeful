export const ROLES = {
  ADMIN: 1,
  STUDENT: 3,
};

export function getHomePathByRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/gestion-alumnos';
    case ROLES.STUDENT:
      return '/portal/resumen';
    default:
      return '/login';
  }
}

export function isPathAllowedForRole(path, role) {
  if (role === ROLES.ADMIN) return path.startsWith('/admin');
  if (role === ROLES.STUDENT) return path.startsWith('/portal');
  return false;
}
