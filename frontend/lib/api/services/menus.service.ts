/**
 * Menus API Service
 * Handles menu and menu items API calls
 */

import { apiClient } from '../client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MenuItem {
  id: number;
  module_name: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  required_permission?: string;
  is_active: boolean;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  is_active: boolean;
  items: MenuItem[];
}

export interface CreateMenuDto {
  name: string;
  slug: string;
  icon?: string;
  order?: number;
  is_active?: boolean;
}

export interface UpdateMenuDto {
  name?: string;
  slug?: string;
  icon?: string;
  order?: number;
  is_active?: boolean;
}

export interface CreateMenuItemDto {
  parent_id?: number;
  module_name: string;
  label: string;
  url: string;
  icon?: string;
  order?: number;
  required_permission?: string;
  is_active?: boolean;
  metadata?: string;
}

export interface UpdateMenuItemDto {
  parent_id?: number;
  module_name?: string;
  label?: string;
  url?: string;
  icon?: string;
  order?: number;
  required_permission?: string;
  is_active?: boolean;
  metadata?: string;
}

// ============================================================================
// Menu Service
// ============================================================================

export const menusService = {
  /**
   * Get all active menus with items filtered by user permissions
   * This is the main endpoint for rendering dynamic menus in the sidebar
   */
  async getActiveMenus(): Promise<Menu[]> {
    const response = await apiClient.get<{ data: Menu[] }>('/menuses/active');
    return response.data || [];
  },

  /**
   * Get menus filtered by current user's permissions
   */
  async getMenusForUser(): Promise<Menu[]> {
    const response = await apiClient.get<Menu[]>('/menuses/for-user');
    return response || [];
  },

  /**
   * Get all menus (admin only)
   */
  async getAllMenus(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{
    data: Menu[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await apiClient.get('/menuses', { params });
  },

  /**
   * Get single menu by ID
   */
  async getMenuById(id: number): Promise<Menu> {
    const response = await apiClient.get<{ data: Menu }>(`/menuses/${id}`);
    return response.data;
  },

  /**
   * Create new menu
   */
  async createMenu(data: CreateMenuDto): Promise<Menu> {
    const response = await apiClient.post<{ data: Menu }>('/menuses', data);
    return response.data;
  },

  /**
   * Update menu
   */
  async updateMenu(id: number, data: UpdateMenuDto): Promise<Menu> {
    const response = await apiClient.patch<{ data: Menu }>(`/menuses/${id}`, data);
    return response.data;
  },

  /**
   * Delete menu
   */
  async deleteMenu(id: number): Promise<void> {
    await apiClient.delete(`/menuses/${id}`);
  },
};

// ============================================================================
// Menu Items Service
// ============================================================================

export const menuItemsService = {
  /**
   * Get all menu items for a specific menu
   */
  async getMenuItems(menuId: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{
    data: MenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await apiClient.get(`/menuses/${menuId}/items`, { params });
  },

  /**
   * Get single menu item by ID
   */
  async getMenuItemById(id: number): Promise<MenuItem> {
    const response = await apiClient.get<{ data: MenuItem }>(`/menu-items/${id}`);
    return response.data;
  },

  /**
   * Create new menu item
   */
  async createMenuItem(menuId: number, data: CreateMenuItemDto): Promise<MenuItem> {
    const response = await apiClient.post<{ data: MenuItem }>(`/menuses/${menuId}/items`, data);
    return response.data;
  },

  /**
   * Update menu item
   */
  async updateMenuItem(id: number, data: UpdateMenuItemDto): Promise<MenuItem> {
    const response = await apiClient.patch<{ data: MenuItem }>(`/menu-items/${id}`, data);
    return response.data;
  },

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: number): Promise<void> {
    await apiClient.delete(`/menu-items/${id}`);
  },

  /**
   * Reorder menu items
   */
  async reorderMenuItems(id: number, newOrder: number): Promise<void> {
    await apiClient.post(`/menu-items/${id}/reorder`, { order: newOrder });
  },
};
