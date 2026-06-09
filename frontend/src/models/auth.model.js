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

  return {
    name: user.name ?? user.email ?? (isAdmin ? 'Administrador' : 'Estudiante'),
    role: user.role,
    displayId: isAdmin
      ? (user.adminId ?? user.id ?? '—')
      : (user.studentId ?? user.id ?? '—'),
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
  },
  admin: {
    name: 'Lic. Roberto Pérez',
    adminId: 'ADM-2024-001',
    email: 'roberto.perez@gradeful.edu',
    role: ROLES.ADMIN,
  },
};
