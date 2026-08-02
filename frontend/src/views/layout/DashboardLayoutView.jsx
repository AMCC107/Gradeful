import { ROLES } from '../../models/roles.model';

import SidebarView from '../shared/sidebar/SidebarView';

/* ── Role chip ─────────────────────────────────────────────────────────── */
const ROLE_META = {
  [ROLES.ADMIN]: {
    label: 'Director',
    className: 'bg-brand-100 text-brand-700 ring-1 ring-brand-200',
  },
  [ROLES.PADRE]: {
    label: 'Padre de familia',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  [ROLES.STUDENT]: {
    label: 'Estudiante',
    className: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  },
  [ROLES.TEACHER]: {
    label: 'Profesor',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
};

function RoleChip({ role }) {
  const meta = ROLE_META[role];
  if (!meta) return null;
  return (
    <span className={['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', meta.className].join(' ')}>
      {meta.label}
    </span>
  );
}

/* ── Avatar initials ───────────────────────────────────────────────────── */
function UserAvatar({ name }) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-xs font-bold text-white shadow-sm"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

/* ── Top header bar ────────────────────────────────────────────────────── */
function DashboardHeaderView({ user, pageTitle, headerExtra = null }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md lg:px-8">
      {/* Page title */}
      <div className="min-w-0 flex-col justify-center">
        <h1 className="truncate text-base font-semibold leading-tight text-slate-900">
          {pageTitle}
        </h1>
        <p className="text-xs text-slate-400">Gradeful Academy</p>
      </div>

      {/* User identity + optional extras (ej. selector de hijos) */}
      <div className="flex shrink-0 items-center gap-3">
        {headerExtra}
        {user?.role != null && <RoleChip role={user.role} />}
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-medium leading-tight text-slate-800">
            {user?.name ?? 'Usuario'}
          </span>
          <span className="text-xs text-slate-400">{user?.email ?? ''}</span>
        </div>
        <UserAvatar name={user?.name} />
      </div>
    </header>
  );
}

/* ── Main layout ───────────────────────────────────────────────────────── */
function DashboardLayoutView({
  user,
  navItems,
  panelLabel,
  pageTitle,
  isMobileMenuOpen,
  onMobileMenuOpen,
  onMobileMenuClose,
  onLogout,
  headerExtra = null,
  children,
}) {
  return (
    <div className="flex min-h-svh bg-slate-100">
      {/* Sidebar */}
      <SidebarView
        user={user}
        navItems={navItems}
        panelLabel={panelLabel}
        onLogout={onLogout}
        isMobileOpen={isMobileMenuOpen}
        onMobileOpen={onMobileMenuOpen}
        onMobileClose={onMobileMenuClose}
      />

      {/* Right-side shell: header + content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <DashboardHeaderView user={user} pageTitle={pageTitle} headerExtra={headerExtra} />

        <main
          id="main-content"
          className="flex-1 px-6 py-8 lg:px-8 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayoutView;
