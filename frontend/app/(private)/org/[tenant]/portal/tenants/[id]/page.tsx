'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  Shield,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Settings,
  Database,
  Layers,
  Check,
  X as XIcon,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tenantsService, Tenant } from '@/lib/api/services/tenants.service';
import { authService } from '@/lib/api/services/auth.service';
import { getCurrentUserIdFromToken } from '@/lib/utils/jwt';
import { toast } from 'sonner';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { PortalLink } from '@/components/ui/portal-link';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
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

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [stats, setStats] = useState({
    users: 0,
    roles: 0,
    permissions: 0,
    modules: 0,
    activity: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkRemoveDialog, setShowBulkRemoveDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log('[TENANT DETAIL] Fetching current user from API...');
        const currentUser = await authService.me();
        console.log('[TENANT DETAIL] Current user fetched from API:', currentUser);
        console.log('[TENANT DETAIL] Setting currentUserId to:', currentUser.id);
        setCurrentUserId(currentUser.id);
        setCurrentUserEmail(currentUser.email);
      } catch (error: any) {
        console.error('[TENANT DETAIL] API call failed:', error);
        console.error('[TENANT DETAIL] Error details:', {
          message: error?.message,
          status: error?.status,
          response: error?.response,
        });
        
        // Fallback: decode JWT token client-side
        console.log('[TENANT DETAIL] Trying JWT fallback...');
        const userIdFromToken = getCurrentUserIdFromToken();
        if (userIdFromToken) {
          console.log('[TENANT DETAIL] Current user ID from JWT token:', userIdFromToken);
          setCurrentUserId(userIdFromToken);
          // Email not available from token, but ID is enough for protection
        } else {
          console.warn('[TENANT DETAIL] Could not fetch current user - protection features disabled');
          console.warn('[TENANT DETAIL] This means switches and checkboxes will NOT be protected!');
        }
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchTenantDetail();
  }, [tenantId]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchTenantUsers(false); // Load users when tab is active
    } else if (activeTab === 'modules') {
      fetchTenantModules();
    }
  }, [activeTab, usersPage, usersLimit, usersSearch]);

  const fetchTenantDetail = async () => {
    try {
      setLoading(true);
      const data = await tenantsService.getDetails(Number(tenantId));
      setTenant(data.tenant);
      setStats(data.stats);
    } catch (error: any) {
      toast.error('Gagal memuat detail tenant', {
        description: error?.message,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantUsers = async (silent: boolean = false) => {
    try {
      const data = await tenantsService.getTenantUsers(Number(tenantId), {
        page: usersPage,
        limit: usersLimit,
        search: usersSearch,
      });
      
      // Merge with existing state to preserve optimistic updates
      setUsers(prevUsers => {
        const newUsers = data.data.map(newUser => {
          const existingUser = prevUsers.find(u => u.id === newUser.id);
          
          // If user is being toggled, keep the optimistic state
          if (existingUser && togglingUserId === newUser.id) {
            return existingUser;
          }
          
          return newUser;
        });
        
        return newUsers;
      });
      
      setUsersTotal(data.meta.total);
    } catch (error: any) {
      if (!silent) {
        toast.error('Gagal memuat users', {
          description: error?.message,
          closeButton: true,
        });
      }
    }
  };

  const fetchTenantModules = async () => {
    try {
      const data = await tenantsService.getTenantModules(Number(tenantId));
      setModules(data.data);
    } catch (error: any) {
      toast.error('Gagal memuat modules', {
        description: error?.message,
        closeButton: true,
      });
    }
  };

  const handleRemoveUser = async (userId: number, userName: string) => {
    setTogglingUserId(userId);
    
    // Save original state for rollback
    const originalUser = users.find(u => u.id === userId);
    if (!originalUser) return;
    
    // Optimistic update - immediately update UI
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, is_active: false } : u
      )
    );
    
    // Optimistic stats update
    setStats(prev => ({ ...prev, users: prev.users - 1 }));

    try {
      const result = await tenantsService.removeUserFromTenant(Number(tenantId), userId);
      toast.success('User dinonaktifkan dari tenant', {
        description: result.message,
        duration: 4000,
        closeButton: true,
      });
    } catch (error: any) {
      // Rollback UI to original state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? originalUser : u
        )
      );
      // Rollback stats
      setStats(prev => ({ ...prev, users: prev.users + 1 }));
      
      toast.error('Gagal menonaktifkan user', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleRestoreUser = async (userId: number, userName: string) => {
    setTogglingUserId(userId);
    
    // Save original state for rollback
    const originalUser = users.find(u => u.id === userId);
    if (!originalUser) return;
    
    // Optimistic update - immediately update UI
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, is_active: true } : u
      )
    );
    
    // Optimistic stats update
    setStats(prev => ({ ...prev, users: prev.users + 1 }));

    try {
      const result = await tenantsService.restoreUserToTenant(Number(tenantId), userId);
      toast.success('User diaktifkan kembali', {
        description: result.message,
        duration: 4000,
        closeButton: true,
      });
    } catch (error: any) {
      // Rollback UI to original state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? originalUser : u
        )
      );
      // Rollback stats
      setStats(prev => ({ ...prev, users: prev.users - 1 }));
      
      toast.error('Gagal mengaktifkan user', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    if (user.is_active) {
      await handleRemoveUser(user.id, user.name || user.email);
    } else {
      await handleRestoreUser(user.id, user.name || user.email);
    }
  };

  // Helper: Check if this is the currently logged-in user
  const isCurrentUser = (user: any) => {
    if (!currentUserId) {
      console.log('[TENANT DETAIL] WARNING: currentUserId is null, protection DISABLED for user:', user.email);
      return false; // If we don't know current user yet, don't protect
    }
    
    // Convert both to numbers for comparison (handle string vs number)
    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const isCurrent = userId === currentUserId;
    
    console.log('[TENANT DETAIL] Checking user:', {
      userId: user.id,
      userIdParsed: userId,
      userEmail: user.email,
      currentUserId: currentUserId,
      isCurrent: isCurrent
    });
    return isCurrent;
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      // Filter out current user from selection
      const selectableUsers = users.filter(u => !isCurrentUser(u));
      setSelectedUsers(selectableUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Get selectable users count (excluding current user)
  const selectableUsersCount = users.filter(u => !isCurrentUser(u)).length;

  const handleBulkRemoveUsers = async () => {
    if (selectedUsers.length === 0) return;

    // Close dialog and proceed
    setShowBulkRemoveDialog(false);

    setBulkActionLoading(true);
    
    // Save original users state for rollback
    const originalUsers = [...users];
    const originalStats = { ...stats };
    
    // Optimistic update - mark all selected users as inactive
    setUsers(prevUsers =>
      prevUsers.map(u =>
        selectedUsers.includes(u.id) ? { ...u, is_active: false } : u
      )
    );
    
    // Optimistic stats update
    setStats(prev => ({ ...prev, users: prev.users - selectedUsers.length }));

    const errors: string[] = [];

    for (const userId of selectedUsers) {
      try {
        await tenantsService.removeUserFromTenant(Number(tenantId), userId);
      } catch (error: any) {
        errors.push(`User ID ${userId}: ${error.message}`);
      }
    }

    setBulkActionLoading(false);

    if (errors.length === 0) {
      toast.success(`${selectedUsers.length} user berhasil dinonaktifkan`, {
        duration: 4000,
        closeButton: true,
      });
      setSelectedUsers([]);
    } else if (errors.length === selectedUsers.length) {
      // All failed - rollback everything
      setUsers(originalUsers);
      setStats(originalStats);
      
      toast.error('Gagal menonaktifkan semua user', {
        description: errors[0],
        duration: 5000,
        closeButton: true,
      });
      setSelectedUsers([]);
    } else {
      // Partial success - need to identify which ones failed and rollback only those
      const failedUserIds = errors.map(err => {
        const match = err.match(/User ID (\d+):/);
        return match ? parseInt(match[1]) : null;
      }).filter(id => id !== null);
      
      // Rollback only failed users
      setUsers(prevUsers =>
        prevUsers.map(u => {
          if (failedUserIds.includes(u.id)) {
            const original = originalUsers.find(orig => orig.id === u.id);
            return original || u;
          }
          return u;
        })
      );
      
      // Adjust stats based on actual success count
      const actualSuccessCount = selectedUsers.length - errors.length;
      setStats(prev => ({ ...prev, users: originalStats.users - actualSuccessCount }));
      
      toast.warning(`${actualSuccessCount} user berhasil, ${errors.length} gagal`, {
        description: errors.slice(0, 2).join(', '),
        duration: 5000,
        closeButton: true,
      });
      setSelectedUsers([]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Tenant tidak ditemukan
          </h3>
          <p className="text-neutral-600 mb-4">
            Tenant dengan ID {tenantId} tidak ditemukan.
          </p>
          <PortalLink href="/tenants">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke List
            </Button>
          </PortalLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <PortalLink href="/tenants">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </PortalLink>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{tenant.name}</h1>
              <p className="text-neutral-600 flex items-center gap-2 mt-1">
                <code className="px-2 py-0.5 bg-neutral-100 rounded text-sm font-mono">
                  {tenant.slug}
                </code>
                {tenant.is_active ? (
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                ) : (
                  <Badge className="bg-neutral-100 text-neutral-700">Inactive</Badge>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PortalLink href={`/tenants/${tenant.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </PortalLink>
          <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600">Total Users</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.users}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600">Roles</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.roles}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600">Modules</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.modules}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600">Activity (7 days)</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.activity}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Tenant Information */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Tenant Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Tenant ID</label>
                  <p className="text-neutral-900 font-semibold mt-1">{tenant.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Name</label>
                  <p className="text-neutral-900 font-semibold mt-1">{tenant.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Slug</label>
                  <p className="text-neutral-900 font-mono text-sm mt-1">{tenant.slug}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Status</label>
                  <div className="mt-1">
                    {tenant.is_active ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-100 text-neutral-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Created At</label>
                  <p className="text-neutral-900 font-semibold mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    {new Date(tenant.created_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Updated At</label>
                  <p className="text-neutral-900 font-semibold mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    {new Date(tenant.updated_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Branding */}
            {(tenant.primary_color || tenant.secondary_color || tenant.logo_url) && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Branding</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tenant.logo_url && (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Logo</label>
                      <div className="mt-2">
                        <img 
                          src={tenant.logo_url} 
                          alt="Tenant Logo" 
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {tenant.primary_color && (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Primary Color</label>
                      <div className="flex items-center gap-3 mt-2">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-neutral-200"
                          style={{ backgroundColor: tenant.primary_color }}
                        />
                        <code className="text-sm font-mono">{tenant.primary_color}</code>
                      </div>
                    </div>
                  )}

                  {tenant.secondary_color && (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Secondary Color</label>
                      <div className="flex items-center gap-3 mt-2">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-neutral-200"
                          style={{ backgroundColor: tenant.secondary_color }}
                        />
                        <code className="text-sm font-mono">{tenant.secondary_color}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6 space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={usersSearch}
                    onChange={(e) => {
                      setUsersSearch(e.target.value);
                      setUsersPage(1); // Reset to page 1 on search
                    }}
                    className="pl-10 h-11"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 whitespace-nowrap">Rows per page:</span>
                  <Select
                    value={usersLimit.toString()}
                    onValueChange={(value) => {
                      setUsersLimit(Number(value));
                      setUsersPage(1); // Reset to page 1 on limit change
                    }}
                  >
                    <SelectTrigger className="w-20 h-11">
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
            </div>

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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBulkRemoveDialog(true)}
                        disabled={bulkActionLoading}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XIcon className="w-4 h-4" />
                        Nonaktifkan ({selectedUsers.length})
                      </Button>
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

            {users.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Belum Ada Users
                </h3>
                <p className="text-neutral-600">
                  Belum ada user yang di-assign ke tenant ini
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                      <tr>
                        <th className="px-6 py-4 text-left w-12">
                          <Checkbox
                            checked={selectableUsersCount > 0 && selectedUsers.length === selectableUsersCount}
                            indeterminate={selectedUsers.length > 0 && selectedUsers.length < selectableUsersCount}
                            onCheckedChange={handleSelectAllUsers}
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Roles
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {users.map((user: any) => (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-neutral-50 transition-colors ${
                            selectedUsers.includes(user.id) ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-6 py-4">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                              disabled={isCurrentUser(user)}
                            />
                          </td>

                          {/* User */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {user.name?.[0] || user.email[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-neutral-900 truncate">
                                  {user.name || 'No name'}
                                </div>
                                <div className="text-sm text-neutral-500 truncate">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Roles */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role: any) => (
                                  <Badge key={role.id} className="bg-purple-100 text-purple-700">
                                    {role.display_name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-neutral-400 italic">No role</span>
                              )}
                            </div>
                          </td>

                          {/* Status - Switch Toggle */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.is_active}
                                onCheckedChange={() => {
                                  console.log('[TENANT DETAIL] Switch clicked for user:', {
                                    userId: user.id,
                                    userEmail: user.email,
                                    isCurrentUser: isCurrentUser(user),
                                    disabled: togglingUserId === user.id || isCurrentUser(user)
                                  });
                                  handleToggleUserStatus(user);
                                }}
                                disabled={togglingUserId === user.id || isCurrentUser(user)}
                              />
                              <span className={`text-sm font-medium ${
                                user.is_active ? 'text-green-600' : 'text-neutral-400'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {isCurrentUser(user) && (
                                <span className="text-xs text-blue-600 italic whitespace-nowrap">(You)</span>
                              )}
                            </div>
                          </td>

                          {/* Last Login */}
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {user.last_login_at
                              ? new Date(user.last_login_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : <span className="text-neutral-400 italic">Never</span>}
                          </td>

                          {/* Joined */}
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersTotal > usersLimit && (
                  <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="text-sm text-neutral-600">
                      Showing {((usersPage - 1) * usersLimit) + 1} to {Math.min(usersPage * usersLimit, usersTotal)} of {usersTotal} users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                        disabled={usersPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(Math.ceil(usersTotal / usersLimit), 5) }, (_, i) => {
                          const totalPages = Math.ceil(usersTotal / usersLimit);
                          let pageNum = i + 1;
                          
                          // Show pages around current page
                          if (totalPages > 5 && usersPage > 3) {
                            pageNum = usersPage - 2 + i;
                          }
                          if (pageNum > totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={usersPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setUsersPage(pageNum)}
                              className="w-9 h-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage(p => p + 1)}
                        disabled={usersPage * usersLimit >= usersTotal}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="mt-6">
            {modules.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
                <Layers className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Belum Ada Modules
                </h3>
                <p className="text-neutral-600">
                  Belum ada module yang terdaftar untuk tenant ini
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module: any) => (
                  <div
                    key={module.id}
                    className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      {module.is_enabled ? (
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      ) : (
                        <Badge className="bg-neutral-100 text-neutral-700">Disabled</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-neutral-900 mb-2">
                      Module #{module.module_id}
                    </h4>
                    <div className="text-sm text-neutral-600 space-y-1">
                      {module.enabled_at && (
                        <p>
                          Enabled:{' '}
                          {new Date(module.enabled_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
              <Settings className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Tenant Settings
              </h3>
              <p className="text-neutral-600">
                Pengaturan dan konfigurasi tenant akan ditampilkan di sini
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Bulk Remove Confirmation Dialog */}
      <AlertDialog open={showBulkRemoveDialog} onOpenChange={setShowBulkRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menonaktifkan {selectedUsers.length} user?</AlertDialogTitle>
            <AlertDialogDescription>
              User-user ini akan dinonaktifkan dari tenant ini. Mereka masih aktif di tenant lain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRemoveUsers}
              className="bg-red-600 hover:bg-red-700"
            >
              Nonaktifkan {selectedUsers.length} User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
