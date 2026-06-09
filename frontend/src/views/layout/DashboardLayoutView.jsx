import SidebarView from '../shared/sidebar/SidebarView';

function DashboardLayoutView({
  user,
  navItems,
  panelLabel,
  isMobileMenuOpen,
  onMobileMenuOpen,
  onMobileMenuClose,
  onLogout,
  children,
}) {
  return (
    <div className="flex min-h-svh bg-slate-100">
      <SidebarView
        user={user}
        navItems={navItems}
        panelLabel={panelLabel}
        onLogout={onLogout}
        isMobileOpen={isMobileMenuOpen}
        onMobileOpen={onMobileMenuOpen}
        onMobileClose={onMobileMenuClose}
      />
      {children}
    </div>
  );
}

export default DashboardLayoutView;
