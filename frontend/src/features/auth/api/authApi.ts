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
  role: 'ADMIN' | 'SHOP_MANAGER';
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

  me: async (): Promise<AuthResponse> => {
    const { data } = await api.get<AuthResponse>(`${BASE_URL}/me`);
    return data;
  },
};
