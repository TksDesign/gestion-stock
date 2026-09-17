import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll position to top-left on every route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' is better for route changes than 'smooth' to avoid weird visual jumps
    });
  }, [pathname]);

  return null;
};
