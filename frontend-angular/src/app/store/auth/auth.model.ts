export type UserRole = 'ADMIN' | 'SHOP_MANAGER' | 'CLIENT';

export interface AuthUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
  customerId?: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};
