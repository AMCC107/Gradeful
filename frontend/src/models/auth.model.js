import { ROLES } from './roles.model';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

export function getAuthUser() {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function getUserRole() {
  const user = getAuthUser();
  return user?.role ?? null;
}

export function getUserProfile() {
  const user = getAuthUser();
  if (!user) return null;

  const isAdmin = user.role === ROLES.ADMIN;
  const isPadre = user.role === ROLES.PADRE;
  const isTeacher = user.role === ROLES.TEACHER;

  let displayId;
  if (isAdmin) displayId = user.adminId ?? user.id ?? '—';
  else if (isPadre) displayId = user.parentId ?? user.id ?? '—';
  else if (isTeacher) displayId = user.teacherId ?? user.id ?? '—';
  else displayId = user.studentId ?? user.id ?? '—';

  let defaultName = 'Estudiante';
  if (isAdmin) defaultName = 'Administrador';
  else if (isPadre) defaultName = 'Padre/Tutor';
  else if (isTeacher) defaultName = 'Profesor';

  return {
    name: user.name ?? user.email ?? defaultName,
    role: user.role,
    displayId,
    email: user.email,
  };
}

export function saveSession({ token, user }) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

export const DEMO_USERS = {
  student: {
    name: 'María González',
    studentId: 'EST-2024-0847',
    email: 'maria@gradeful.edu',
    role: ROLES.STUDENT,
    password: 'estudiante123',
  },
  padre: {
    name: 'Carlos González',
    parentId: 'PAD-2024-0321',
    email: 'carlos.gonzalez@mail.com',
    role: ROLES.PADRE,
    password: 'padre123',
  },
  admin: {
    name: 'Lic. Roberto Pérez',
    adminId: 'ADM-2024-001',
    email: 'roberto.perez@gradeful.edu',
    role: ROLES.ADMIN,
    password: 'admin123',
  },
  teacher: {
    name: 'Prof. Laura Méndez',
    teacherId: 'DOC-001',
    email: 'laura.mendez@gradeful.edu',
    role: ROLES.TEACHER,
    password: 'profesor123',
  },
};
