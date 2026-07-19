/**
 * Users API Service
 * Handles user management API calls
 */

import { apiClient } from '../client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface User {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_active: boolean;
  is_verified?: boolean;
  is_email_verified?: boolean;
  phone?: string;
  phone_number?: string;
  avatar_url?: string;
  last_login_at?: string;
  last_login_ip?: string;
  must_change_password: boolean;
  password_changed_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
  deleted_at?: string | null;
  deleted_by?: number | null;
  roles?: Role[];
  tenants?: TenantAssignment[];
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
}

export interface TenantAssignment {
  id: number;
  slug: string;
  name: string;
  logo_url?: string | null;
  is_active: boolean;
  role_name: string;
  role_display_name: string;
  user_role_assigned_at: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active?: boolean;
}

export interface AssignRolesDto {
  role_ids: number[];
}

// ============================================================================
// Users Service
// ============================================================================

export const usersService = {
  /**
   * Get all users with pagination and filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    role?: string;
    status?: string;
    includeDeleted?: boolean;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await apiClient.get('/users', { params });
  },

  /**
   * Get single user by ID
   */
  async getById(id: number): Promise<User> {
    // Backend returns user directly, not wrapped in data
    return await apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Create new user
   */
  async create(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<{ data: User }>('/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  async update(id: number, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<{ data: User }>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Hard delete user (permanent)
   */
  async hardDelete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}/hard`);
  },

  /**
   * Assign roles to user
   */
  async assignRoles(id: number, data: AssignRolesDto): Promise<User> {
    const response = await apiClient.post<{ data: User }>(`/users/${id}/assign-roles`, data);
    return response.data;
  },

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}/remove-role/${roleId}`);
  },

  /**
   * Activate user
   */
  async activate(id: number): Promise<void> {
    await apiClient.patch(`/users/${id}/activate`);
  },

  /**
   * Deactivate user
   */
  async deactivate(id: number): Promise<void> {
    await apiClient.patch(`/users/${id}/deactivate`);
  },

  /**
   * Bulk activate users
   */
  async bulkActivate(ids: number[]): Promise<void> {
    await apiClient.post('/users/bulk/activate', { ids });
  },

  /**
   * Bulk deactivate users
   */
  async bulkDeactivate(ids: number[]): Promise<void> {
    await apiClient.post('/users/bulk/deactivate', { ids });
  },

  /**
   * Bulk delete users
   */
  async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.post('/users/bulk/delete', { ids });
  },

  /**
   * Restore soft deleted user
   */
  async restore(id: number): Promise<void> {
    await apiClient.patch(`/users/${id}/restore`);
  },

  /**
   * Bulk restore users
   */
  async bulkRestore(ids: number[]): Promise<void> {
    await apiClient.post('/users/bulk/restore', { ids });
  },
};
