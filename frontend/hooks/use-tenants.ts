/**
 * useTenants Hook
 */

'use client';

import { useState, useCallback } from 'react';
import { tenantsService, Tenant } from '@/lib/api/services/tenants.service';
import { toast } from 'sonner';

interface UseTenantsReturn {
  tenants: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchTenants: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    includeDeleted?: boolean;
  }) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTenants(): UseTenantsReturn {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<any>({});

  const fetchTenants = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    includeDeleted?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setLastParams(params || {});

      const response = await tenantsService.getAll(params);

      setTenants(response.data);
      setTotal(response.total);
      setPage(response.page);
      setLimit(response.limit);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load tenants';
      setError(errorMessage);
      toast.error('Gagal memuat data tenant', {
        description: errorMessage,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchTenants(lastParams);
  }, [fetchTenants, lastParams]);

  return {
    tenants,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    fetchTenants,
    refetch,
  };
}

export function useTenant(id: string | number) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tenantsService.getById(Number(id));
      setTenant(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load tenant';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    tenant,
    loading,
    error,
    fetchTenant,
    refetch: fetchTenant,
  };
}
