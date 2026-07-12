import { apiClient } from '../client';
import type {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  PaginatedResponse,
  Permission,
} from '../types';

export const rolesService = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<PaginatedResponse<Role>> {
    return apiClient.get<PaginatedResponse<Role>>('/roles', { params });
  },

  async getById(id: number): Promise<Role> {
    return apiClient.get<Role>(`/roles/${id}`);
  },

  async create(data: CreateRoleDTO): Promise<Role> {
    return apiClient.post<Role>('/roles', data);
  },

  async update(id: number, data: UpdateRoleDTO): Promise<Role> {
    return apiClient.patch<Role>(`/roles/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/roles/${id}`);
  },

  async getAllPermissions(): Promise<Permission[]> {
    return apiClient.get<Permission[]>('/permissions');
  },

  async assignPermissions(id: number, permissionIds: number[]): Promise<Role> {
    return apiClient.post<Role>(`/roles/${id}/permissions`, {
      permission_ids: permissionIds,
    });
  },
};
