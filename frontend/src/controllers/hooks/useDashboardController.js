import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../models/auth.model';

export function useDashboardController() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    clearSession();
    navigate('/login', { replace: true });
  };

  return {
    mobileMenu: {
      isOpen: isMobileMenuOpen,
      open: () => setIsMobileMenuOpen(true),
      close: () => setIsMobileMenuOpen(false),
    },
    handlers: { onLogout: handleLogout },
  };
}
