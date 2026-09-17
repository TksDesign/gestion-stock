import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

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

export type UserRole = 'ADMIN' | 'SHOP_MANAGER' | 'CLIENT';

export interface AuthResponse {
  token: string;
  userId: string;
  customerId: string | null;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
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
  role: UserRole;
  customerId: string | null;
}

const BASE_URL = `${environment.apiGatewayUrl}/api/v1/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${BASE_URL}/login`, request);
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${BASE_URL}/register`, request);
  }

  createShopManager(request: CreateManagerRequest) {
    return this.http.post<AuthResponse>(`${BASE_URL}/admin/managers`, request);
  }

  me() {
    return this.http.get<AuthResponse>(`${BASE_URL}/me`);
  }

  findUsers(role?: UserRole) {
    return this.http.get<UserSummary[]>(`${BASE_URL}/admin/users`, {
      params: role ? { role } : {},
    });
  }
}
