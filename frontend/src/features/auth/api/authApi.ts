import { api } from '../../../lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  customerId: string | null;
  firstname: string;
  lastname: string;
  email: string;
  role: 'ADMIN' | 'SHOP_MANAGER' | 'CLIENT';
}

export interface CreateManagerRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface UserSummary {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'ADMIN' | 'SHOP_MANAGER' | 'CLIENT';
  customerId: string | null;
}

const BASE_URL = '/api/v1/auth';

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(`${BASE_URL}/login`, request);
    return data;
  },

  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(`${BASE_URL}/register`, request);
    return data;
  },

  createShopManager: async (request: CreateManagerRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(`${BASE_URL}/admin/managers`, request);
    return data;
  },

  me: async (): Promise<AuthResponse> => {
    const { data } = await api.get<AuthResponse>(`${BASE_URL}/me`);
    return data;
  },

  findUsers: async (role?: 'ADMIN' | 'SHOP_MANAGER' | 'CLIENT'): Promise<UserSummary[]> => {
    const { data } = await api.get<UserSummary[]>(`${BASE_URL}/admin/users`, { params: role ? { role } : {} });
    return data;
  },
};
