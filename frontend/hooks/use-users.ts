/**
 * useUsers Hook
 * React hook for fetching and managing users
 */

'use client';

import { useState, useEffect } from 'react';
import { usersService, User } from '@/lib/api/services/users.service';
import { toast } from 'sonner';

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  role?: string;
  status?: string;
  includeDeleted?: boolean;
}

interface UseUsersReturn {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch users list with pagination and filters
 */
export function useUsers(params: UseUsersParams = {}): UseUsersReturn {
  const [data, setData] = useState<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    users: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await usersService.getAll(params);
      
      setData({
        users: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load users';
      setError(errorMessage);
      
      // Only show toast on refetch, not initial load
      if (data.users.length > 0) {
        toast.error('Failed to load users', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [params.page, params.limit, params.search, params.sort, params.order, params.role, params.status, params.includeDeleted]);

  return {
    ...data,
    loading,
    error,
    refetch: fetchUsers,
  };
}

/**
 * Hook to fetch single user by ID
 */
export function useUser(id: number | string | string[] | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    // Validasi dan normalize ID
    let userId: number;
    
    if (!id) {
      setError('User ID is required');
      setLoading(false);
      return;
    }
    
    // Handle array dari dynamic route
    if (Array.isArray(id)) {
      userId = Number(id[0]);
    } else {
      userId = Number(id);
    }
    
    // Validasi ID adalah number yang valid
    if (isNaN(userId) || userId <= 0) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const data = await usersService.getById(userId);
      setUser(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load user';
      setError(errorMessage);
      toast.error('Failed to load user', {
        description: errorMessage,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
