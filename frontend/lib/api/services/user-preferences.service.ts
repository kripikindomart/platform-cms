import { apiClient } from '../client';
import type { UserPreferences, UpdateUserPreferencesDTO } from '../types';

export const userPreferencesService = {
  /**
   * Get current user's preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>('/users/me/preferences');
  },

  /**
   * Update current user's preferences
   */
  async updatePreferences(data: UpdateUserPreferencesDTO): Promise<UserPreferences> {
    return apiClient.put<UserPreferences>('/users/me/preferences', data);
  },

  /**
   * Get user preferences by ID (Admin only)
   */
  async getUserPreferences(userId: number): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>(`/users/${userId}/preferences`);
  },

  /**
   * Update user preferences by ID (Admin only)
   */
  async updateUserPreferences(userId: number, data: UpdateUserPreferencesDTO): Promise<UserPreferences> {
    return apiClient.put<UserPreferences>(`/users/${userId}/preferences`, data);
  },

  /**
   * Enable single tenant mode
   */
  async enableSingleTenantMode(defaultTenantId: number): Promise<UserPreferences> {
    return this.updatePreferences({
      is_single_tenant_mode: true,
      default_tenant_id: defaultTenantId,
      skip_org_selection: true,
      show_org_switcher: false,
    });
  },

  /**
   * Disable single tenant mode
   */
  async disableSingleTenantMode(): Promise<UserPreferences> {
    return this.updatePreferences({
      is_single_tenant_mode: false,
      default_tenant_id: null,
      skip_org_selection: false,
      show_org_switcher: true,
    });
  },
};
