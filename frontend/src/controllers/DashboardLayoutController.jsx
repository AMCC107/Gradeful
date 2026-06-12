import { Outlet } from 'react-router-dom';
import { useDashboardController } from './hooks/useDashboardController';
import { usePageTitle } from './hooks/usePageTitle';
import DashboardLayoutView from '../views/layout/DashboardLayoutView';

function DashboardLayoutController({ user, navItems, panelLabel }) {
  const { mobileMenu, handlers } = useDashboardController();
  const pageTitle = usePageTitle(navItems, panelLabel);

  return (
    <DashboardLayoutView
      user={user}
      navItems={navItems}
      panelLabel={panelLabel}
      pageTitle={pageTitle}
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
