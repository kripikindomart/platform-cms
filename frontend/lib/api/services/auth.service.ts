import { apiClient } from '../client';
import type { AuthResponse, LoginDTO, RegisterDTO } from '../types';

export const authService = {
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Save token to cookie
    if (response.access_token) {
      document.cookie = `token=${response.access_token}; path=/; max-age=${response.expires_in || 86400}`;
    }
    
    return response;
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Save token to cookie
    if (response.access_token) {
      document.cookie = `token=${response.access_token}; path=/; max-age=${response.expires_in || 86400}`;
    }
    
    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    
    // Clear token cookie
    document.cookie = 'token=; path=/; max-age=0';
  },

  async me(): Promise<AuthResponse['user']> {
    const response = await apiClient.get<AuthResponse['user']>('/users/me');
    return response;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');
    
    // Update token cookie
    if (response.access_token) {
      document.cookie = `token=${response.access_token}; path=/; max-age=${response.expires_in || 86400}`;
    }
    
    return response;
  },
};

