import { apiClient } from '../client';
import type {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  PaginatedResponse,
} from '../types';

export const usersService = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role_id?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>('/users', { params });
  },

  async getById(id: number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async create(data: CreateUserDTO): Promise<User> {
    return apiClient.post<User>('/users', data);
  },

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },

  async assignRoles(id: number, roleIds: number[]): Promise<User> {
    return apiClient.post<User>(`/users/${id}/roles`, { role_ids: roleIds });
  },

  async removeRole(id: number, roleId: number): Promise<void> {
    return apiClient.delete(`/users/${id}/roles/${roleId}`);
  },
};
