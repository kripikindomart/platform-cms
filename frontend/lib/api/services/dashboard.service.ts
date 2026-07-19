/**
 * Dashboard API Service
 * Handles dashboard statistics and activity data
 */

import { apiClient } from '../client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  activeTenants: number;
  totalRoles: number;
  totalPermissions: number;
  userGrowth: number;
  tenantGrowth: number;
  roleGrowth: number;
  permissionGrowth: number;
}

export interface ActivityLog {
  id: number;
  action: string;
  user: string;
  userId?: number;
  time: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  resource?: string;
  resourceId?: number;
  details?: string;
}

export interface SystemStatus {
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  uptimePercentage: string;
  lastChecked: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    api: 'up' | 'down';
  };
}

// ============================================================================
// Dashboard Service
// ============================================================================

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ data: DashboardStats }>('/dashboard/stats');
    return response.data;
  },

  /**
   * Get recent activity logs
   */
  async getRecentActivity(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ActivityLog[]> {
    const response = await apiClient.get<{ data: ActivityLog[] }>('/dashboard/recent-activity', { params });
    return response.data || [];
  },

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await apiClient.get<{ data: SystemStatus }>('/dashboard/system-status');
    return response.data;
  },

  /**
   * Get user growth chart data (last 7 days)
   */
  async getUserGrowth(days: number = 7): Promise<{
    labels: string[];
    data: number[];
  }> {
    const response = await apiClient.get<{
      data: { labels: string[]; data: number[] };
    }>('/dashboard/user-growth', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get tenant distribution
   */
  async getTenantDistribution(): Promise<{
    active: number;
    inactive: number;
    suspended: number;
  }> {
    const response = await apiClient.get<{
      data: { active: number; inactive: number; suspended: number };
    }>('/dashboard/tenant-distribution');
    return response.data;
  },
};
