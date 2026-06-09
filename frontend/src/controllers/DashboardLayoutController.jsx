import { Outlet } from 'react-router-dom';
import { useDashboardController } from './hooks/useDashboardController';
import DashboardLayoutView from '../views/layout/DashboardLayoutView';

function DashboardLayoutController({ user, navItems, panelLabel }) {
  const { mobileMenu, handlers } = useDashboardController();

  return (
    <DashboardLayoutView
      user={user}
      navItems={navItems}
      panelLabel={panelLabel}
      isMobileMenuOpen={mobileMenu.isOpen}
      onMobileMenuOpen={mobileMenu.open}
      onMobileMenuClose={mobileMenu.close}
      onLogout={handlers.onLogout}
    >
      <Outlet />
    </DashboardLayoutView>
  );
}

export default DashboardLayoutController;
