import { apiClient } from '../client';
import type { AuthResponse, LoginDTO, RegisterDTO } from '../types';

export const authService = {
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  },

  async me(): Promise<AuthResponse['user']> {
    return apiClient.get<AuthResponse['user']>('/auth/me');
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh');
  },
};
