'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsersTable } from './components/users-table';
import { useUsers } from '@/hooks/use-users';
import { Skeleton } from '@/components/ui/skeleton';
import { PortalLink } from '@/components/ui/portal-link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usersService } from '@/lib/api/services/users.service';
import { toast } from 'sonner';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { users, total, totalPages, loading, error, refetch } = useUsers({
    page,
    limit,
    search: searchQuery,
    includeDeleted: true, // Include soft-deleted users so we can filter them for trash tab
  });

  // Filter users based on tab
  const filteredByTab = useMemo(() => {
    if (activeTab === 'trash') {
      return users.filter(u => u.deleted_at !== null && u.deleted_at !== undefined);
    }
    return users.filter(u => !u.deleted_at);
  }, [users, activeTab]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const activeUsers = filteredByTab.filter(u => u.is_active && !u.deleted_at);
    const inactiveUsers = filteredByTab.filter(u => !u.is_active && !u.deleted_at);
    const recentLogins = activeUsers.filter((u) => {
      if (!u.last_login_at) return false;
      const daysSinceLogin = (Date.now() - new Date(u.last_login_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 7;
    });

    return {
      total: filteredByTab.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      recentLogins: recentLogins.length,
      activePercentage: filteredByTab.length > 0 ? Math.round((activeUsers.length / filteredByTab.length) * 100) : 0,
    };
  }, [filteredByTab]);

  // Filter users based on selected filters
  const filteredUsers = useMemo(() => {
    let filtered = [...filteredByTab];

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((u) => u.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((u) => !u.is_active);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => 
        (u as any).roles?.includes(roleFilter)
      );
    }

    return filtered;
  }, [filteredByTab, statusFilter, roleFilter]);

  // Get unique roles for filter
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    users.forEach((user) => {
      const userRoles = (user as any).roles || [];
      userRoles.forEach((role: string) => roles.add(role));
    });
    return Array.from(roles).filter(r => r !== 'No Role');
  }, [users]);

  const handleRefresh = () => {
    refetch();
    setSelectedUsers([]);
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      await usersService.bulkActivate(selectedUsers);
      toast.success(`${selectedUsers.length} pengguna berhasil diaktifkan`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedUsers([]);
      refetch();
    } catch (error: any) {
      toast.error('Gagal mengaktifkan pengguna', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      await usersService.bulkDeactivate(selectedUsers);
      toast.success(`${selectedUsers.length} pengguna berhasil dinonaktifkan`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedUsers([]);
      refetch();
    } catch (error: any) {
      toast.error('Gagal menonaktifkan pengguna', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    // Tutup dialog
    setShowBulkDeleteDialog(false);
    
    try {
      setBulkActionLoading(true);
      await usersService.bulkDelete(selectedUsers);
      toast.success(`${selectedUsers.length} pengguna berhasil dihapus`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedUsers([]);
      refetch();
    } catch (error: any) {
      toast.error('Gagal menghapus pengguna', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      await usersService.bulkRestore(selectedUsers);
      toast.success(`${selectedUsers.length} pengguna berhasil dipulihkan`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedUsers([]);
      refetch();
    } catch (error: any) {
      toast.error('Gagal memulihkan pengguna', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">User Management</h1>
              <p className="text-neutral-600 mt-0.5">
                {loading ? 'Loading...' : `${total} total users in this organization`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>

            <PortalLink href="users/create">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all gap-2">
                <Plus className="w-4 h-4" />
                Create User
              </Button>
            </PortalLink>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Users</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{statistics.total}</p>
                <p className="text-xs text-neutral-500 mt-1">All registered users</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Active Users</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold text-green-600">{statistics.active}</p>
                  <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {statistics.activePercentage}%
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Currently active</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Inactive Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Inactive Users</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold text-red-600">{statistics.inactive}</p>
                  <span className="text-sm font-medium text-neutral-400">
                    {statistics.total > 0 ? Math.round((statistics.inactive / statistics.total) * 100) : 0}%
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Deactivated accounts</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          {/* Recent Logins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Recent Activity</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold text-indigo-600">{statistics.recentLogins}</p>
                  <span className="text-sm font-medium text-neutral-400">7 days</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Logged in last week</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Active Users
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Trash
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {selectedUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                        </p>
                        <p className="text-sm text-neutral-600">Choose an action to apply</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeTab === 'active' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkActivate}
                            disabled={bulkActionLoading}
                            className="gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Activate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkDeactivate}
                            disabled={bulkActionLoading}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Deactivate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBulkDeleteDialog(true)}
                            disabled={bulkActionLoading}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkRestore}
                          disabled={bulkActionLoading}
                          className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Restore ({selectedUsers.length})
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUsers([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
              <div className="space-y-4">
                {/* Search and Filter Toggle */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  
                  <Button
                    variant={showFilters ? 'default' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 h-11"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {(statusFilter !== 'all' || roleFilter !== 'all') && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                        {[statusFilter !== 'all' ? 1 : 0, roleFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-neutral-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Status Filter */}
                          <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                              Status
                            </label>
                            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="All Statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active Only</SelectItem>
                                <SelectItem value="inactive">Inactive Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Role Filter */}
                          <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                              Role
                            </label>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="All Roles" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {availableRoles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Clear Filters */}
                          <div className="flex items-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setStatusFilter('all');
                                setRoleFilter('all');
                              }}
                              className="w-full"
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
                <div className="text-red-600 font-semibold mb-2">Failed to load users</div>
                <p className="text-sm text-neutral-600 mb-4">{error}</p>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  {activeTab === 'trash' ? (
                    <Trash2 className="w-8 h-8 text-neutral-400" />
                  ) : (
                    <UsersIcon className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {activeTab === 'trash' ? 'Trash Kosong' : 'Tidak Ada User'}
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  {activeTab === 'trash' 
                    ? 'Tidak ada user yang dihapus. User yang dihapus akan muncul di sini.'
                    : searchQuery 
                      ? 'Tidak ada user yang cocok dengan pencarian Anda.'
                      : 'Belum ada user terdaftar. Klik tombol "Create User" untuk menambahkan user pertama.'}
                </p>
                {activeTab !== 'trash' && !searchQuery && (
                  <PortalLink href="users/create">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create User
                    </Button>
                  </PortalLink>
                )}
              </div>
            ) : (
              <UsersTable
                users={filteredUsers}
                total={total}
                page={page}
                limit={limit}
                totalPages={totalPages}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onRefetch={refetch}
                selectedUsers={selectedUsers}
                onSelectUsers={setSelectedUsers}
                isTrash={activeTab === 'trash'}
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus {selectedUsers.length} pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              User-user ini akan dipindahkan ke trash. Anda dapat memulihkannya nanti dari tab Trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus {selectedUsers.length} User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
