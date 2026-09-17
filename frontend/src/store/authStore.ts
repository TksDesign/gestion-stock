import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '../lib/queryClient';

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
      login: (user, token) => {
        // Vide le cache React Query : sans ça, un changement de compte (ex. une gérante
        // qui se déconnecte et se reconnecte sous un autre compte) pouvait afficher
        // transitoirement les données en cache du compte précédent (commandes/ventes
        // d'une autre boutique) avant que le premier refetch ne les remplace.
        queryClient.clear();
        set({ isAuthenticated: true, user, token });
      },
      logout: () => {
        queryClient.clear();
        set({ isAuthenticated: false, user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
