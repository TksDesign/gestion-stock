import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

export const useUsers = (role?: 'ADMIN' | 'SHOP_MANAGER' | 'CLIENT') =>
  useQuery({
    queryKey: ['auth', 'users', role ?? 'all'] as const,
    queryFn: () => authApi.findUsers(role),
  });
