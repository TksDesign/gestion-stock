import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, UserRole } from '../store/authStore';
import { useAuthModalStore } from '../store/authModalStore';

const RedirectAndOpenModal = () => {
  const openModal = useAuthModalStore((state) => state.openModal);

  useEffect(() => {
    openModal('signin');
  }, [openModal]);

  return <Navigate to="/cart" replace />;
};

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <RedirectAndOpenModal />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
