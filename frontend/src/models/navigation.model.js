import {
  Home,
  UserRound,
  Users,
  UserCog,
  Shield,
  GraduationCap,
  CreditCard,
  ClipboardList,
  Settings,
  LogOut,
} from 'lucide-react';

export const LOGOUT_ITEM = {
  id: 'logout',
  label: 'Cerrar Sesión',
  icon: LogOut,
};

export const STUDENT_NAV_ITEMS = [
  { id: 'resumen', label: 'Resumen', path: '/portal/resumen', icon: Home, end: true },
  { id: 'mi-informacion', label: 'Mi Información', path: '/portal/mi-informacion', icon: UserRound },
  { id: 'calificaciones', label: 'Calificaciones', path: '/portal/calificaciones', icon: GraduationCap },
  { id: 'pagos', label: 'Colegiatura y Pagos', path: '/portal/pagos', icon: CreditCard },
  { id: 'tramites', label: 'Trámites', path: '/portal/tramites', icon: ClipboardList },
];

export const ADMIN_NAV_ITEMS = [
  { id: 'resumen', label: 'Resumen de Gestión', path: '/admin/resumen', icon: Home, end: true },
  { id: 'gestion-alumnos', label: 'Gestión de Alumnos', path: '/admin/gestion-alumnos', icon: Users },
  { id: 'gestion-usuarios', label: 'Gestión de Usuarios', path: '/admin/gestion-usuarios', icon: UserCog },
  { id: 'gestion-roles', label: 'Gestión de Roles', path: '/admin/gestion-roles', icon: Shield },
  { id: 'registro-notas', label: 'Registro de Notas', path: '/admin/registro-notas', icon: GraduationCap },
  { id: 'tesoreria', label: 'Tesorería y Pagos', path: '/admin/tesoreria', icon: CreditCard },
  { id: 'tramites', label: 'Control de Trámites', path: '/admin/tramites', icon: ClipboardList },
  { id: 'perfil', label: 'Mi Perfil', path: '/admin/perfil', icon: UserRound },
  { id: 'configuracion', label: 'Configuración Global', path: '/admin/configuracion', icon: Settings },
];

// Padre de familia: solo ve Calificaciones, Pagos y Perfil
export const PADRE_NAV_ITEMS = [
  { id: 'calificaciones', label: 'Calificaciones', path: '/padre/calificaciones', icon: GraduationCap },
  { id: 'pagos', label: 'Colegiatura y Pagos', path: '/padre/pagos', icon: CreditCard },
  { id: 'perfil', label: 'Mi Perfil', path: '/padre/perfil', icon: UserRound },
];
