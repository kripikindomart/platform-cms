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
  ChevronRight
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [hardDeletingId, setHardDeletingId] = useState<number | null>(null);

  const { tenants, total, totalPages, loading, fetchTenants } = useTenants();

  // Local state untuk optimistic updates
  const [localTenants, setLocalTenants] = useState<Tenant[]>(tenants);

  // Sync dengan tenants dari hook
  useEffect(() => {
    setLocalTenants(tenants);
  }, [tenants]);

  useEffect(() => {
    fetchTenants({ 
      page, 
      limit, 
      search: searchQuery,
      includeDeleted: true // Include soft-deleted untuk tab trash
    });
  }, [page, limit, searchQuery, fetchTenants]);

  // Filter tenants based on tab
  const filteredByTab = useMemo(() => {
    if (activeTab === 'trash') {
      return localTenants.filter(t => t.deleted_at !== null && t.deleted_at !== undefined);
    }
    return localTenants.filter(t => !t.deleted_at);
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
    fetchTenants({ page, limit, search: searchQuery });
    setSelectedTenants([]);
  };

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
      const selectableTenants = filteredByTab.filter(t => t.slug !== currentTenantSlug);
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
      await tenantsService.bulkDelete(selectedTenants);
      toast.success(`${selectedTenants.length} tenant berhasil dihapus`, {
        duration: 4000,
        closeButton: true,
      });
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
      await tenantsService.hardDelete(id);
      toast.success('Tenant berhasil dihapus permanen', {
        description: 'Data tenant telah dihapus dari database',
        duration: 4000,
        closeButton: true,
      });
      handleRefresh();
      setShowHardDeleteDialog(false);
    } catch (error: any) {
      toast.error('Gagal menghapus permanen tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    }
  };

  // Helper: Check if this is the current tenant
  const isCurrentTenant = (tenant: Tenant) => {
    return tenant.slug === currentTenantSlug;
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

          <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all">
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Active Tenants
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Trash
            </TabsTrigger>
          </TabsList>

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
                          disabled={isCurrentTenant(tenant)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                            {tenant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">
                              {tenant.name}
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
                              disabled={togglingStatusId === tenant.id || isCurrentTenant(tenant)}
                            />
                            <span className={`text-sm font-medium ${
                              tenant.is_active ? 'text-green-600' : 'text-neutral-400'
                            }`}>
                              {tenant.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {isCurrentTenant(tenant) && (
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
                                disabled={isCurrentTenant(tenant)}
                                onClick={() => {
                                  if (!isCurrentTenant(tenant)) {
                                    // Handle delete action (placeholder - will be implemented later)
                                    toast.error('Delete function belum diimplementasikan', {
                                      closeButton: true,
                                    });
                                  }
                                }}
                              >
                                {isCurrentTenant(tenant) ? (
                                  <>
                                    <span className="line-through">Delete</span>
                                    <span className="ml-2 text-xs text-neutral-400">(Tenant aktif)</span>
                                  </>
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

      {/* Hard Delete Confirmation Dialog */}
      <AlertDialog open={showHardDeleteDialog} onOpenChange={setShowHardDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Hapus Permanen?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold">Tindakan ini tidak dapat dibatalkan!</p>
              <p>
                Tenant ini akan <span className="font-semibold text-red-600">dihapus secara permanen</span> dari database. 
                Semua data terkait tenant akan hilang dan tidak dapat dipulihkan.
              </p>
              <p className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                💡 <strong>Saran:</strong> Gunakan "Restore" jika Anda hanya ingin mengaktifkan kembali tenant ini.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => hardDeletingId && handleHardDelete(hardDeletingId)}
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
