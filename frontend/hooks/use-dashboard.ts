/**
 * useDashboard Hook
 * React hook for fetching dashboard data
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  dashboardService, 
  DashboardStats, 
  ActivityLog, 
  SystemStatus 
} from '@/lib/api/services/dashboard.service';
import { toast } from 'sonner';

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDashboardActivityReturn {
  activities: ActivityLog[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDashboardSystemReturn {
  systemStatus: SystemStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load stats';
      setError(errorMessage);
      
      // Don't show toast on initial load, only on refetch
      if (stats !== null) {
        toast.error('Failed to load dashboard stats', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Hook to fetch recent activity
 */
export function useDashboardActivity(limit: number = 10): UseDashboardActivityReturn {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getRecentActivity({ limit });
      setActivities(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load activity';
      setError(errorMessage);
      
      // Don't show toast on initial load
      if (activities.length > 0) {
        toast.error('Failed to load recent activity', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [limit]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivity,
  };
}

/**
 * Hook to fetch system status
 */
export function useDashboardSystem(): UseDashboardSystemReturn {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getSystemStatus();
      setSystemStatus(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load system status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  return {
    systemStatus,
    loading,
    error,
    refetch: fetchSystemStatus,
  };
}

/**
 * Hook to fetch all dashboard data at once
 */
export function useDashboard() {
  const stats = useDashboardStats();
  const activity = useDashboardActivity(5);
  const system = useDashboardSystem();

  const loading = stats.loading || activity.loading || system.loading;
  const error = stats.error || activity.error || system.error;

  const refetchAll = async () => {
    await Promise.all([
      stats.refetch(),
      activity.refetch(),
      system.refetch(),
    ]);
  };

  return {
    stats: stats.stats,
    activities: activity.activities,
    systemStatus: system.systemStatus,
    loading,
    error,
    refetch: refetchAll,
  };
}
