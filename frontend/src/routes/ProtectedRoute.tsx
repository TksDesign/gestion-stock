import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAuthModalStore } from '../store/authModalStore';

const RedirectAndOpenModal = () => {
  const openModal = useAuthModalStore((state) => state.openModal);
  
  useEffect(() => {
    openModal('signin');
  }, [openModal]);
  
  return <Navigate to="/cart" replace />;
};

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <RedirectAndOpenModal />;
  }

  return <Outlet />;
};
