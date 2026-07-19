/**
 * Roles API Service
 * Handles role management API calls
 */

import { apiClient } from '../client';
import type { Role, Permission, CreateRoleDTO, UpdateRoleDTO } from '../types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AssignPermissionsDto {
  permission_ids: number[];
}

// Re-export types for convenience
export type { Role, Permission, CreateRoleDTO, UpdateRoleDTO };

// ============================================================================
// Roles Service
// ============================================================================

export const rolesService = {
  /**
   * Get all roles with pagination and filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{
    data: Role[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await apiClient.get('/roles', { params });
  },

  /**
   * Get single role by ID
   */
  async getById(id: number): Promise<Role> {
    return await apiClient.get<Role>(`/roles/${id}`);
  },

  /**
   * Create new role
   */
  async create(data: CreateRoleDTO): Promise<Role> {
    return await apiClient.post<Role>('/roles', data);
  },

  /**
   * Update role
   */
  async update(id: number, data: UpdateRoleDTO): Promise<Role> {
    return await apiClient.patch<Role>(`/roles/${id}`, data);
  },

  /**
   * Delete role
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },

  /**
   * Assign permissions to role
   */
  async assignPermissions(id: number, data: AssignPermissionsDto): Promise<{
    message: string;
    role_id: number;
    assigned_count: number;
  }> {
    return await apiClient.post(`/roles/${id}/permissions`, data);
  },

  /**
   * Remove permission from role
   */
  async removePermission(roleId: number, permissionId: number): Promise<void> {
    await apiClient.delete(`/roles/${roleId}/remove-permission/${permissionId}`);
  },

  /**
   * Get all permissions
   */
  async getAllPermissions(params?: {
    page?: number;
    limit?: number;
    resource?: string;
  }): Promise<{
    data: Permission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await apiClient.get('/permissions', { params });
  },
};
