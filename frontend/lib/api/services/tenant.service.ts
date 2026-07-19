/**
 * Tenant API Service
 * Handles tenant configuration and settings
 */

import { apiClient } from '../client';

export interface TenantConfig {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  is_active: boolean;
}

export const tenantService = {
  /**
   * Get current tenant configuration
   */
  async getCurrentTenant(): Promise<TenantConfig> {
    return await apiClient.get<TenantConfig>('/tenants/current');
  },

  /**
   * Get tenant by slug
   */
  async getTenantBySlug(slug: string): Promise<TenantConfig> {
    return await apiClient.get<TenantConfig>(`/tenants/slug/${slug}`);
  },
};
