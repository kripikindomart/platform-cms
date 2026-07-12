'use client';

import { useState } from 'react';
import { usersService } from '@/lib/api/services/users.service';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/lib/api/types';
import { toast } from 'sonner';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role_id?: number;
    is_active?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getAll(params);
      setUsers(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err as Error);
      toast.error('Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserDTO) => {
    try {
      setLoading(true);
      const newUser = await usersService.create(data);
      toast.success('User berhasil dibuat');
      return newUser;
    } catch (err) {
      toast.error('Gagal membuat user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number, data: UpdateUserDTO) => {
    try {
      setLoading(true);
      const updatedUser = await usersService.update(id, data);
      toast.success('User berhasil diupdate');
      return updatedUser;
    } catch (err) {
      toast.error('Gagal mengupdate user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      await usersService.delete(id);
      toast.success('User berhasil dihapus');
      // Refresh list
      await fetchUsers({ page: pagination.page, per_page: pagination.perPage });
    } catch (err) {
      toast.error('Gagal menghapus user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
