import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'SHOP_MANAGER' | 'CLIENT';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
  customerId?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
