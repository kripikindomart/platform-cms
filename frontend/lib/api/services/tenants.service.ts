import { apiClient } from '../client';
import type {
  Tenant,
  CreateTenantDTO,
  UpdateTenantDTO,
  PaginatedResponse,
} from '../types';

export const tenantsService = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Tenant>> {
    return apiClient.get<PaginatedResponse<Tenant>>('/tenants', { params });
  },

  async getById(id: number): Promise<Tenant> {
    return apiClient.get<Tenant>(`/tenants/${id}`);
  },

  async create(data: CreateTenantDTO): Promise<Tenant> {
    return apiClient.post<Tenant>('/tenants', data);
  },

  async update(id: number, data: UpdateTenantDTO): Promise<Tenant> {
    return apiClient.patch<Tenant>(`/tenants/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/tenants/${id}`);
  },
};
