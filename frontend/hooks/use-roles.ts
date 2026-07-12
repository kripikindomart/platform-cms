'use client';

import { useState } from 'react';
import { rolesService } from '@/lib/api/services/roles.service';
import type { Role, CreateRoleDTO, UpdateRoleDTO } from '@/lib/api/types';
import { toast } from 'sonner';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchRoles = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesService.getAll(params);
      setRoles(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err as Error);
      toast.error('Gagal memuat data roles');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (data: CreateRoleDTO) => {
    try {
      setLoading(true);
      const newRole = await rolesService.create(data);
      toast.success('Role berhasil dibuat');
      return newRole;
    } catch (err) {
      toast.error('Gagal membuat role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: number, data: UpdateRoleDTO) => {
    try {
      setLoading(true);
      const updatedRole = await rolesService.update(id, data);
      toast.success('Role berhasil diupdate');
      return updatedRole;
    } catch (err) {
      toast.error('Gagal mengupdate role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: number) => {
    try {
      setLoading(true);
      await rolesService.delete(id);
      toast.success('Role berhasil dihapus');
      // Refresh list
      await fetchRoles({ page: pagination.page, per_page: pagination.perPage });
    } catch (err) {
      toast.error('Gagal menghapus role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}
