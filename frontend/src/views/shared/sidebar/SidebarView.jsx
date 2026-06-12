import { Menu, X } from 'lucide-react';
import SidebarNavView from './SidebarNavView';

function SidebarHeaderView({ user }) {
  return (
    <header className="mb-6 border-b border-slate-200 pb-5">
      <div className="flex items-center gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-sm font-bold text-white shadow-md shadow-brand-600/20"
          aria-hidden="true"
        >
          GF
        </div>
        <div className="min-w-0 text-left">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gradeful Academy
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {user?.name ?? 'Usuario'}
          </p>
          <p className="truncate text-xs text-slate-500">
            ID: {user?.displayId ?? '—'}
          </p>
        </div>
      </div>
    </header>
  );
}

function SidebarPanelView({
  user,
  navItems,
  panelLabel,
  onLogout,
  onMobileClose,
  showCloseButton,
}) {
  return (
    <aside
      className="flex h-full w-72 flex-col bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:border-r lg:border-slate-200 lg:shadow-sm"
      aria-label={panelLabel}
    >
      {showCloseButton && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <span className="text-sm font-semibold text-slate-900">Menú</span>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6 lg:px-5 lg:pt-6">
        <SidebarHeaderView user={user} />
        <SidebarNavView navItems={navItems} onNavigate={onMobileClose} onLogout={onLogout} />
      </div>
    </aside>
  );
}

function SidebarView({
  user,
  navItems,
  panelLabel,
  onLogout,
  isMobileOpen,
  onMobileOpen,
  onMobileClose,
}) {
  return (
    <>
      <div className="hidden lg:block lg:w-72 lg:shrink-0">
        <SidebarPanelView
          user={user}
          navItems={navItems}
          panelLabel={panelLabel}
          onLogout={onLogout}
          showCloseButton={false}
        />
      </div>

      {!isMobileOpen && (
        <button
          type="button"
          onClick={onMobileOpen}
          className="fixed left-4 top-4 z-20 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
      )}

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={onMobileClose}
            aria-label="Cerrar menú lateral"
          />
          <div className="absolute inset-y-0 left-0 z-50 shadow-2xl">
            <SidebarPanelView
              user={user}
              navItems={navItems}
              panelLabel={panelLabel}
              onLogout={onLogout}
              onMobileClose={onMobileClose}
              showCloseButton
            />
          </div>
        </div>
      )}
    </>
  );
}

export default SidebarView;
