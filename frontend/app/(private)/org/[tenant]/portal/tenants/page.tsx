'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Search,
  Users,
  CheckCircle2,
  XCircle,
  MoreVertical,
  RefreshCw,
  Check,
  X,
  Trash2,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTenants } from '@/hooks/use-tenants';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { tenantsService, Tenant } from '@/lib/api/services/tenants.service';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function TenantsPage() {
  const { push } = usePortalRouter();
  const params = useParams();
  const currentTenantSlug = params.tenant as string; // e.g., "platform-admin"
  
  // Get initial tab from URL query param or default to 'active'
  const [activeTab, setActiveTab] = useState<'active' | 'trash' | 'backups'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'trash' || tabParam === 'backups') {
        return tabParam;
      }
    }
    return 'active';
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const [hardDeletingId, setHardDeletingId] = useState<number | null>(null);
  const [showSoftDeleteDialog, setShowSoftDeleteDialog] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [softDeletingId, setSoftDeletingId] = useState<number | null>(null);
  const [backupSchema, setBackupSchema] = useState(true); // Default: backup schema
  const [schemaBackups, setSchemaBackups] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [showDeleteBackupDialog, setShowDeleteBackupDialog] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<{id: number; schemaName: string} | null>(null);

  // Update URL when tab changes
  const handleTabChange = (newTab: 'active' | 'trash' | 'backups') => {
    setActiveTab(newTab);
    setSelectedTenants([]); // Clear selections
    
    // Update URL without reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const { tenants, total, totalPages, loading, fetchTenants } = useTenants();

  // Local state untuk optimistic updates
  const [localTenants, setLocalTenants] = useState<Tenant[]>(tenants);

  // Find current tenant ID from slug
  const currentTenantId = useMemo(() => {
    const currentTenant = localTenants.find(t => t.slug === currentTenantSlug);
    return currentTenant?.id;
  }, [localTenants, currentTenantSlug]);

  // Helper to check if tenant is current
  const isCurrentTenant = (tenantId: number) => {
    return tenantId === currentTenantId;
  };

  // Sync dengan tenants dari hook
  useEffect(() => {
    setLocalTenants(tenants);
  }, [tenants]);

  useEffect(() => {
    fetchTenants({ 
      page, 
      limit, 
      search: searchQuery,
      includeDeleted: true // Always fetch all tenants, filter in frontend by tab
    });
  }, [page, limit, searchQuery, fetchTenants]);

  // Filter tenants based on tab
  const filteredByTab = useMemo(() => {
    if (activeTab === 'trash') {
      // Show only soft-deleted tenants (deleted_at is not null)
      return localTenants.filter(t => t.deleted_at !== null && t.deleted_at !== undefined);
    }
    // Show only active tenants (deleted_at is null or undefined)
    return localTenants.filter(t => t.deleted_at === null || t.deleted_at === undefined);
  }, [localTenants, activeTab]);

  // Calculate real total based on filtered data
  const displayTotal = filteredByTab.length;
  const displayTotalPages = Math.ceil(displayTotal / limit) || 1;

  // Calculate stats
  const stats = useMemo(() => {
    const active = filteredByTab.filter(t => t.is_active).length;
    const inactive = filteredByTab.filter(t => !t.is_active).length;

    return [
      {
        title: 'Total Tenants',
        value: total || 0,
        icon: Building2,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        title: 'Active Tenants',
        value: active,
        icon: CheckCircle2,
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        title: 'Inactive',
        value: inactive,
        icon: XCircle,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
      {
        title: 'Total Users',
        value: '2,543',
        icon: Users,
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
    ];
  }, [filteredByTab, total]);

  const handleRefresh = () => {
    fetchTenants({ page, limit, search: searchQuery, includeDeleted: true });
    setSelectedTenants([]);
    
    // Fetch backups if on backups tab
    if (activeTab === 'backups') {
      fetchSchemaBackups();
    }
  };

  const fetchSchemaBackups = async () => {
    try {
      setLoadingBackups(true);
      const backups = await tenantsService.getSchemaBackups();
      setSchemaBackups(backups);
    } catch (error: any) {
      toast.error('Gagal memuat schema backups', {
        description: error?.message,
        duration: 3000,
      });
    } finally {
      setLoadingBackups(false);
    }
  };

  // Fetch backups when switching to backups tab
  useEffect(() => {
    if (activeTab === 'backups') {
      fetchSchemaBackups();
    }
  }, [activeTab]);

  const handleToggleStatus = async (tenant: Tenant) => {
    setTogglingStatusId(tenant.id);
    
    // Optimistic update
    setLocalTenants(prev => 
      prev.map(t => 
        t.id === tenant.id 
          ? { ...t, is_active: !t.is_active } 
          : t
      )
    );
    
    try {
      if (tenant.is_active) {
        await tenantsService.deactivate(tenant.id);
        toast.success('Tenant dinonaktifkan', {
          duration: 3000,
          closeButton: true,
        });
      } else {
        await tenantsService.activate(tenant.id);
        toast.success('Tenant diaktifkan', {
          duration: 3000,
          closeButton: true,
        });
      }
    } catch (error: any) {
      // Rollback jika gagal
      setLocalTenants(prev => 
        prev.map(t => 
          t.id === tenant.id 
            ? { ...t, is_active: tenant.is_active } 
            : t
        )
      );
      
      toast.error('Gagal mengubah status tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Filter out current tenant from selection
      const selectableTenants = filteredByTab.filter(t => !isCurrentTenant(t.id));
      setSelectedTenants(selectableTenants.map(t => t.id));
    } else {
      setSelectedTenants([]);
    }
  };

  const handleSelectTenant = (tenantId: number, checked: boolean) => {
    if (checked) {
      setSelectedTenants([...selectedTenants, tenantId]);
    } else {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId));
    }
  };

  const handleBulkActivate = async () => {
    if (selectedTenants.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      await tenantsService.bulkActivate(selectedTenants);
      toast.success(`${selectedTenants.length} tenant berhasil diaktifkan`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedTenants([]);
      handleRefresh();
    } catch (error: any) {
      toast.error('Gagal mengaktifkan tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedTenants.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      await tenantsService.bulkDeactivate(selectedTenants);
      toast.success(`${selectedTenants.length} tenant berhasil dinonaktifkan`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedTenants([]);
      handleRefresh();
    } catch (error: any) {
      toast.error('Gagal menonaktifkan tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTenants.length === 0) return;
    
    setShowBulkDeleteDialog(false);
    
    try {
      setBulkActionLoading(true);
      const result = await tenantsService.bulkDelete(selectedTenants);
      
      if (result.failed === 0) {
        // All success
        toast.success(`${result.success} tenant berhasil dihapus`, {
          duration: 4000,
          closeButton: true,
        });
      } else if (result.success === 0) {
        // All failed
        const errorMsg = result.errors[0]?.message || 'Unknown error';
        toast.error('Gagal menghapus semua tenant', {
          description: errorMsg,
          duration: 5000,
          closeButton: true,
        });
      } else {
        // Partial success
        const failedMessages = result.errors.slice(0, 2).map(e => e.message).join(', ');
        toast.warning(`${result.success} berhasil, ${result.failed} gagal`, {
          description: failedMessages,
          duration: 5000,
          closeButton: true,
        });
      }
      
      setSelectedTenants([]);
      handleRefresh();
    } catch (error: any) {
      toast.error('Gagal menghapus tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedTenants.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      await tenantsService.bulkRestore(selectedTenants);
      toast.success(`${selectedTenants.length} tenant berhasil dipulihkan`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedTenants([]);
      handleRefresh();
    } catch (error: any) {
      toast.error('Gagal memulihkan tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await tenantsService.restore(id);
      toast.success('Tenant berhasil dipulihkan', {
        duration: 4000,
        closeButton: true,
      });
      handleRefresh();
    } catch (error: any) {
      toast.error('Gagal memulihkan tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    }
  };

  const handleHardDelete = async (id: number) => {
    try {
      await tenantsService.hardDelete(id, backupSchema);
      
      if (backupSchema) {
        toast.success('Tenant berhasil dihapus permanen', {
          description: 'Schema telah di-backup dan akan dihapus otomatis setelah 15 hari',
          duration: 5000,
          closeButton: true,
        });
      } else {
        toast.success('Tenant dan schema berhasil dihapus permanen', {
          description: 'Semua data telah dihapus dari database',
          duration: 4000,
          closeButton: true,
        });
      }
      
      handleRefresh();
      setShowHardDeleteDialog(false);
      setHardDeletingId(null);
      setBackupSchema(true); // Reset to default
    } catch (error: any) {
      toast.error('Gagal menghapus permanen tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    }
  };

  const handleSoftDelete = async () => {
    if (!tenantToDelete || softDeletingId !== null) return; // Prevent double execution

    const tenantId = tenantToDelete.id;
    const tenantName = tenantToDelete.name;
    
    setShowSoftDeleteDialog(false);
    setSoftDeletingId(tenantId);
    setTenantToDelete(null);

    try {
      await tenantsService.delete(tenantId);
      toast.success('Tenant berhasil dihapus', {
        description: `Tenant "${tenantName}" telah dipindahkan ke trash`,
        duration: 4000,
        closeButton: true,
      });
      handleRefresh();
    } catch (error: any) {
      // Check if tenant already deleted (409 Conflict)
      const errorCode = error?.response?.data?.code;
      if (error?.response?.status === 409 && errorCode === 'TENANT_ALREADY_DELETED') {
        toast.info('Tenant sudah dihapus sebelumnya', {
          description: 'Data akan di-refresh',
          duration: 3000,
        });
        handleRefresh();
      } else if (errorCode === 'TENANT_NOT_FOUND') {
        toast.info('Tenant tidak ditemukan', {
          description: 'Mungkin sudah dihapus oleh user lain',
          duration: 3000,
        });
        handleRefresh();
      } else {
        toast.error('Gagal menghapus tenant', {
          description: error?.response?.data?.message || error?.message,
          duration: 5000,
          closeButton: true,
        });
      }
    } finally {
      setSoftDeletingId(null);
    }
  };

  const handleDeleteSchemaBackup = async (backupId: number, schemaName: string) => {
    setBackupToDelete({ id: backupId, schemaName });
    setShowDeleteBackupDialog(true);
  };

  const confirmDeleteSchemaBackup = async () => {
    if (!backupToDelete) return;

    setShowDeleteBackupDialog(false);

    try {
      await tenantsService.deleteSchemaBackup(backupToDelete.id);
      toast.success('Schema backup berhasil dihapus permanen', {
        description: `Schema "${backupToDelete.schemaName}" telah dihapus dari database`,
        duration: 4000,
        closeButton: true,
      });
      fetchSchemaBackups();
    } catch (error: any) {
      toast.error('Gagal menghapus schema backup', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setBackupToDelete(null);
    }
  };

  const isAllSelected = filteredByTab.length > 0 && selectedTenants.length === filteredByTab.length;
  const isSomeSelected = selectedTenants.length > 0 && selectedTenants.length < filteredByTab.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Tenant Management</h1>
            <p className="text-neutral-600 mt-0.5">
              {loading ? 'Loading...' : `${total || 0} total tenants`}
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

          <Button 
            onClick={() => push('/tenants/create')}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tenant
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.title}
              className="group relative p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 overflow-hidden"
            >
              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-neutral-600">{stat.title}</h3>
                  <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as 'active' | 'trash' | 'backups')} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Active Tenants
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Trash
            </TabsTrigger>
            <TabsTrigger value="backups" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Schema Backups
            </TabsTrigger>
          </TabsList>

          {/* Active & Trash Tabs - Show tenant lists */}
          {(activeTab === 'active' || activeTab === 'trash') && (
          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {selectedTenants.length > 0 && (
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
                          {selectedTenants.length} tenant{selectedTenants.length > 1 ? 's' : ''} dipilih
                        </p>
                        <p className="text-sm text-neutral-600">Pilih aksi yang ingin diterapkan</p>
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
                            Aktifkan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkDeactivate}
                            disabled={bulkActionLoading}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Nonaktifkan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBulkDeleteDialog(true)}
                            disabled={bulkActionLoading}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
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
                          <RotateCcw className="w-4 h-4" />
                          Pulihkan ({selectedTenants.length})
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTenants([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search tenants by name or slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Tenants Table */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredByTab.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  {activeTab === 'trash' ? (
                    <Trash2 className="w-8 h-8 text-neutral-400" />
                  ) : (
                    <Building2 className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {activeTab === 'trash' ? 'Trash Kosong' : 'Tidak Ada Tenant'}
                </h3>
                <p className="text-neutral-600">
                  {activeTab === 'trash'
                    ? 'Tidak ada tenant yang dihapus. Tenant yang dihapus akan muncul di sini.'
                    : searchQuery
                      ? 'Try adjusting your search query'
                      : 'Create your first tenant to get started'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-left w-12">
                      <Checkbox
                        checked={isAllSelected || isSomeSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredByTab.map((tenant) => (
                    <motion.tr
                      key={tenant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-neutral-50 transition-colors ${
                        selectedTenants.includes(tenant.id) ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedTenants.includes(tenant.id)}
                          onCheckedChange={(checked) => handleSelectTenant(tenant.id, checked as boolean)}
                          disabled={isCurrentTenant(tenant.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {tenant.logo_url ? (
                            <img 
                              src={tenant.logo_url} 
                              alt={`${tenant.name} logo`}
                              className="w-10 h-10 rounded-xl object-cover border border-neutral-200"
                              onError={(e) => {
                                // Fallback ke initial jika logo gagal load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold ${tenant.logo_url ? 'hidden' : ''}`}>
                            {tenant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-900">
                                {tenant.name}
                              </span>
                              {isCurrentTenant(tenant.id) && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-neutral-500">
                              ID: {tenant.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono text-neutral-700">
                          {tenant.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        {activeTab === 'trash' ? (
                          <span className="text-sm text-neutral-400 italic">Deleted</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={tenant.is_active}
                              onCheckedChange={() => handleToggleStatus(tenant)}
                              disabled={togglingStatusId === tenant.id || isCurrentTenant(tenant.id)}
                            />
                            <span className={`text-sm font-medium ${
                              tenant.is_active ? 'text-green-600' : 'text-neutral-400'
                            }`}>
                              {tenant.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {isCurrentTenant(tenant.id) && (
                              <span className="text-xs text-blue-600 italic whitespace-nowrap">(Current)</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(tenant.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeTab === 'trash' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(tenant.id)}
                              className="gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setHardDeletingId(tenant.id);
                                setShowHardDeleteDialog(true);
                              }}
                              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus Permanen
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-neutral-100 h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => push(`/tenants/${tenant.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => push(`/tenants/${tenant.id}/edit`)}>
                                Edit Tenant
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                disabled={isCurrentTenant(tenant.id) || softDeletingId === tenant.id}
                                onClick={() => {
                                  if (!isCurrentTenant(tenant.id)) {
                                    setTenantToDelete(tenant);
                                    setShowSoftDeleteDialog(true);
                                  }
                                }}
                              >
                                {isCurrentTenant(tenant.id) ? (
                                  <>
                                    <span className="line-through">Delete</span>
                                    <span className="ml-2 text-xs text-neutral-400">(Tenant aktif)</span>
                                  </>
                                ) : softDeletingId === tenant.id ? (
                                  'Deleting...'
                                ) : (
                                  'Delete'
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredByTab.length > 0 && (
              <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-neutral-600">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, displayTotal)} of {displayTotal} tenants
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 whitespace-nowrap">Rows per page:</span>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(Number(value));
                        setPage(1); // Reset to page 1 on limit change
                      }}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(displayTotalPages, 5) }, (_, i) => {
                      let pageNum = i + 1;
                      if (displayTotalPages > 5 && page > 3) {
                        pageNum = page - 2 + i;
                      }
                      if (pageNum > displayTotalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-8 h-8 p-0"
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(displayTotalPages, p + 1))}
                    disabled={page >= displayTotalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
              </div>
            )}
          </TabsContent>
          )}

          {/* Schema Backups Tab */}
          {activeTab === 'backups' && (
          <TabsContent value="backups" className="mt-6 space-y-4">
            {loadingBackups ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : schemaBackups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  <RotateCcw className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Tidak Ada Schema Backup
                </h3>
                <p className="text-neutral-600">
                  Schema backup akan muncul di sini setelah Anda menghapus permanen tenant dengan opsi backup.
                  <br />
                  Backup akan otomatis dihapus setelah 15 hari.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Tenant Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Schema Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Size / Tables
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Backup Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Expires In
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {schemaBackups.map((backup) => (
                        <motion.tr
                          key={backup.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-neutral-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-neutral-900">
                                {backup.tenant_name}
                              </div>
                              <div className="text-sm text-neutral-500">
                                Tenant ID: {backup.tenant_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono text-neutral-700">
                              {backup.schema_name}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-neutral-900 font-medium">
                                {backup.backup_size || 'N/A'}
                              </div>
                              <div className="text-neutral-500">
                                {backup.table_count} tables
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {new Date(backup.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {backup.is_expired ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Expired
                              </span>
                            ) : backup.days_remaining <= 3 ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                {backup.days_remaining} days
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                {backup.days_remaining} days
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSchemaBackup(backup.id, backup.schema_name)}
                              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Now
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Info Footer */}
                <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Informasi Schema Backups:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Schema backup dibuat otomatis saat hard delete tenant dengan opsi backup</li>
                        <li>• Backup akan otomatis dihapus setelah <strong>15 hari</strong></li>
                        <li>• Anda dapat menghapus backup lebih awal dengan tombol "Delete Now"</li>
                        <li>• Expired backups akan dihapus otomatis oleh sistem cleanup job</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          )}
        </Tabs>
      </motion.div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus {selectedTenants.length} tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              Tenant-tenant ini akan dipindahkan ke trash. Anda dapat memulihkannya nanti dari tab Trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus {selectedTenants.length} Tenant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Soft Delete Confirmation Dialog */}
      <AlertDialog open={showSoftDeleteDialog} onOpenChange={setShowSoftDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Konfirmasi Hapus Tenant
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3 px-6 py-4">
            <p className="text-sm text-neutral-600">
              Apakah Anda yakin ingin menghapus tenant <strong>"{tenantToDelete?.name}"</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-sm text-amber-800 font-medium">
                Informasi:
              </p>
              <p className="text-sm text-amber-700">
                • Tenant akan dipindahkan ke tab Trash
                <br />
                • Data masih tersimpan dan dapat dipulihkan
                <br />
                • Users tidak dapat mengakses tenant ini
                <br />
                • Gunakan "Restore" untuk mengaktifkan kembali
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={softDeletingId !== null}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSoftDelete}
              disabled={softDeletingId !== null}
              className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
            >
              {softDeletingId !== null ? 'Menghapus...' : 'Ya, Pindahkan ke Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirmation Dialog */}
      <AlertDialog open={showHardDeleteDialog} onOpenChange={setShowHardDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Hapus Permanen?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 px-6 py-4">
            <p className="font-semibold text-red-600 text-sm">Tindakan ini tidak dapat dibatalkan!</p>
            <p className="text-sm text-neutral-600">
              Tenant ini akan <span className="font-semibold text-red-600">dihapus secara permanen</span> dari database. 
            </p>
            
            {/* Schema Backup Option */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="backup-schema"
                  checked={backupSchema}
                  onCheckedChange={(checked) => setBackupSchema(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="backup-schema" 
                    className="text-sm font-medium text-blue-900 cursor-pointer block mb-1"
                  >
                    Backup schema database (Rekomendasi)
                  </label>
                  <p className="text-xs text-blue-700">
                    Schema akan di-backup selama <strong>15 hari</strong> sebelum dihapus otomatis. 
                    Anda dapat menghapusnya lebih awal dari tab "Schema Backups".
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              <p className="text-sm text-red-800 font-medium">
                Peringatan:
              </p>
              <p className="text-sm text-red-700">
                {backupSchema 
                  ? 'Tenant record akan dihapus, tapi schema database akan di-backup selama 15 hari.'
                  : 'Tenant record DAN schema database akan dihapus permanen. Semua data akan hilang selamanya!'
                }
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
              <p className="text-sm text-amber-800 font-medium">
                Alternatif:
              </p>
              <p className="text-sm text-amber-700">
                Gunakan <strong>"Restore"</strong> dari tab Trash jika Anda ingin mengaktifkan kembali tenant ini.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setBackupSchema(true); // Reset
              setHardDeletingId(null);
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => hardDeletingId && handleHardDelete(hardDeletingId)}
              className="bg-red-600 hover:bg-red-700 font-semibold"
            >
              {backupSchema ? 'Hapus & Backup Schema' : 'Hapus Permanen Semua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Schema Backup Confirmation Dialog */}
      <AlertDialog open={showDeleteBackupDialog} onOpenChange={setShowDeleteBackupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Hapus Schema Backup?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3 px-6 py-4">
            <p className="font-semibold text-red-600 text-sm">Tindakan ini tidak dapat dibatalkan!</p>
            <p className="text-sm text-neutral-600">
              Schema backup <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono">{backupToDelete?.schemaName}</code> akan dihapus permanen dari database.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                Database schema dan semua tabel di dalamnya akan di-drop secara permanen. Data tidak dapat dipulihkan setelah dihapus.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBackupToDelete(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSchemaBackup}
              className="bg-red-600 hover:bg-red-700 font-semibold"
            >
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
