export const ROLES = {
  ADMIN: 1,
  DIRECTOR: 1,
  PADRE: 2,
  STUDENT: 3,
  TEACHER: 4,
};

export function getHomePathByRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/gestion-alumnos';
    case ROLES.PADRE:
      return '/padre/calificaciones';
    case ROLES.STUDENT:
      return '/portal/resumen';
    case ROLES.TEACHER:
      return '/profesor/actividades';
    default:
      return '/login';
  }
}

export function isPathAllowedForRole(path, role) {
  if (role === ROLES.ADMIN) return path.startsWith('/admin');
  if (role === ROLES.PADRE) return path.startsWith('/padre');
  if (role === ROLES.STUDENT) return path.startsWith('/portal');
  if (role === ROLES.TEACHER) return path.startsWith('/profesor');
  return false;
}
