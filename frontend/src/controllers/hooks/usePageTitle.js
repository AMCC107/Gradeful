import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Derives the active page title from the navItems list and the current URL.
 * Returns the label of the matching nav item, or a fallback string.
 */
export function usePageTitle(navItems, fallback = 'Panel') {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (!navItems?.length) return fallback;

    // Exact match first, then prefix match
    const exact = navItems.find((item) => pathname === item.path);
    if (exact) return exact.label;

    const prefix = navItems.find(
      (item) => !item.end && pathname.startsWith(item.path)
    );
    return prefix ? prefix.label : fallback;
  }, [pathname, navItems, fallback]);
}
