/**
 * Tenants API Service
 */

import { apiClient } from '../client';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  is_active: boolean;
  config?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  deleted_by?: number | null;
}

export interface CreateTenantDto {
  name: string;
  slug?: string; // Optional karena backend auto-generate jika tidak ada
  description?: string;
  is_active?: boolean;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  domain?: string;
  subscription_tier?: string;
  config?: Record<string, any>;
}

export interface UpdateTenantDto {
  name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  is_active?: boolean;
  config?: Record<string, any>;
}

export const tenantsService = {
  /**
   * Get all tenants with pagination
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    includeDeleted?: boolean;
  }): Promise<{
    data: Tenant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await apiClient.get('/tenants', { params });
  },

  /**
   * Get tenant by ID
   */
  async getById(id: number): Promise<Tenant> {
    return await apiClient.get(`/tenants/${id}`);
  },

  /**
   * Get tenant by slug
   */
  async getBySlug(slug: string): Promise<Tenant> {
    return await apiClient.get(`/tenants/by-slug/${slug}`);
  },

  /**
   * Create new tenant
   */
  async create(data: CreateTenantDto): Promise<Tenant> {
    return await apiClient.post('/tenants', data);
  },

  /**
   * Provision tenant (full setup with schema)
   */
  async provision(data: CreateTenantDto): Promise<Tenant> {
    return await apiClient.post('/tenants/provision', data);
  },

  /**
   * Update tenant
   */
  async update(id: number, data: UpdateTenantDto): Promise<Tenant> {
    return await apiClient.patch(`/tenants/${id}`, data);
  },

  /**
   * Delete tenant
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tenants/${id}`);
  },

  /**
   * Restore tenant
   */
  async restore(id: number): Promise<Tenant> {
    return await apiClient.post(`/tenants/${id}/restore`);
  },

  /**
   * Hard delete tenant (permanent)
   */
  async hardDelete(id: number): Promise<void> {
    await apiClient.delete(`/tenants/${id}/hard`);
  },

  /**
   * Assign user to tenant
   */
  async assignUser(tenantId: number, userId: number, roleName: string): Promise<void> {
    await apiClient.post(`/tenants/${tenantId}/assign-user`, {
      userId,
      roleName,
    });
  },

  /**
   * Activate tenant
   */
  async activate(id: number): Promise<Tenant> {
    return await apiClient.patch(`/tenants/${id}`, { is_active: true });
  },

  /**
   * Deactivate tenant
   */
  async deactivate(id: number): Promise<Tenant> {
    return await apiClient.patch(`/tenants/${id}`, { is_active: false });
  },

  /**
   * Bulk activate tenants
   */
  async bulkActivate(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.activate(id)));
  },

  /**
   * Bulk deactivate tenants
   */
  async bulkDeactivate(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.deactivate(id)));
  },

  /**
   * Bulk delete tenants
   */
  async bulkDelete(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.delete(id)));
  },

  /**
   * Bulk restore tenants
   */
  async bulkRestore(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.restore(id)));
  },

  /**
   * Bulk hard delete tenants (permanent)
   */
  async bulkHardDelete(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => this.hardDelete(id)));
  },

  /**
   * Get tenant details with statistics
   */
  async getDetails(id: number): Promise<{
    tenant: Tenant;
    stats: {
      users: number;
      roles: number;
      permissions: number;
      modules: number;
      activity: number;
    };
  }> {
    return await apiClient.get(`/tenants/${id}/details`);
  },

  /**
   * Get tenant users
   */
  async getTenantUsers(id: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return await apiClient.get(`/tenants/${id}/users`, { params });
  },

  /**
   * Get tenant modules
   */
  async getTenantModules(id: number): Promise<{
    data: any[];
    message?: string;
  }> {
    return await apiClient.get(`/tenants/${id}/modules`);
  },

  /**
   * Remove user from tenant (deactivate in this tenant only)
   */
  async removeUserFromTenant(tenantId: number, userId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    return await apiClient.delete(`/tenants/${tenantId}/users/${userId}`);
  },

  /**
   * Restore user to tenant (reactivate in this tenant)
   */
  async restoreUserToTenant(tenantId: number, userId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    return await apiClient.post(`/tenants/${tenantId}/users/${userId}/restore`);
  },
};
