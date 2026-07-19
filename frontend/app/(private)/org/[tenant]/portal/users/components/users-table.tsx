'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  UserCog,
  ChevronLeft,
  ChevronRight,
  Settings,
  RotateCcw,
  Building2
} from 'lucide-react';
import { User, usersService } from '@/lib/api/services/users.service';
import { authService } from '@/lib/api/services/auth.service';
import { getCurrentUserIdFromToken } from '@/lib/utils/jwt';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { usePortalRouter } from '@/hooks/use-portal-router';
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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';

interface UsersTableProps {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefetch: () => void;
  selectedUsers: number[];
  onSelectUsers: (ids: number[]) => void;
  isTrash?: boolean;
}

export function UsersTable({
  users,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  onRefetch,
  selectedUsers,
  onSelectUsers,
  isTrash = false,
}: UsersTableProps) {
  const { push } = usePortalRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hardDeletingId, setHardDeletingId] = useState<number | null>(null);
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Local state untuk optimistic updates
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Try to get from API if endpoint exists
        const currentUser = await authService.me();
        setCurrentUserId(currentUser.id);
      } catch (error) {
        console.warn('API call failed, trying JWT fallback:', error);
        
        // Fallback: decode JWT token client-side
        const userIdFromToken = getCurrentUserIdFromToken();
        if (userIdFromToken) {
          console.log('Current user ID from JWT token:', userIdFromToken);
          setCurrentUserId(userIdFromToken);
        } else {
          console.warn('Could not fetch current user - protection features disabled');
        }
      }
    };
    fetchCurrentUser();
  }, []);

  // Sync dengan props users ketika berubah dari luar (refetch, pagination, dll)
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleDelete = async (id: number) => {
    try {
      await usersService.delete(id);
      toast.success('User berhasil dihapus', {
        duration: 4000,
        closeButton: true,
      });
      onRefetch();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast.error('Gagal menghapus user', {
        description: error?.response?.data?.message || error.message,
        duration: 5000,
        closeButton: true,
      });
    }
  };

  const handleHardDelete = async (id: number) => {
    try {
      await usersService.hardDelete(id);
      toast.success('User berhasil dihapus permanen', {
        description: 'Data user telah dihapus dari database',
        duration: 4000,
        closeButton: true,
      });
      onRefetch();
      setShowHardDeleteDialog(false);
    } catch (error: any) {
      toast.error('Gagal menghapus permanen user', {
        description: error?.response?.data?.message || error.message,
        duration: 5000,
        closeButton: true,
      });
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await usersService.restore(id);
      toast.success('User berhasil dipulihkan', {
        duration: 4000,
        closeButton: true,
      });
      onRefetch();
    } catch (error: any) {
      toast.error('Gagal memulihkan user', {
        description: error?.response?.data?.message || error.message,
        duration: 5000,
        closeButton: true,
      });
    }
  };

  const handleToggleStatus = async (user: User) => {
    setTogglingStatusId(user.id);
    
    // Optimistic update - langsung ubah UI
    setLocalUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === user.id 
          ? { ...u, is_active: !u.is_active } 
          : u
      )
    );
    
    try {
      if (user.is_active) {
        await usersService.deactivate(user.id);
        toast.success('User dinonaktifkan', {
          duration: 3000,
          closeButton: true,
        });
      } else {
        await usersService.activate(user.id);
        toast.success('User diaktifkan', {
          duration: 3000,
          closeButton: true,
        });
      }
      // Tidak perlu refetch, karena sudah optimistic update
    } catch (error: any) {
      // Rollback jika gagal
      setLocalUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, is_active: user.is_active } 
            : u
        )
      );
      
      toast.error('Gagal mengubah status user', {
        description: error?.response?.data?.message || error.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Filter out current user from selection
      const selectableUsers = localUsers.filter(u => u.id !== currentUserId);
      onSelectUsers(selectableUsers.map(u => u.id));
    } else {
      onSelectUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      onSelectUsers([...selectedUsers, userId]);
    } else {
      onSelectUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Helper: Check if this is the currently logged-in user
  const isCurrentUser = (user: User) => {
    if (!currentUserId) return false; // If we don't know current user yet, don't protect
    
    // Convert both to numbers for comparison (handle string vs number)
    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    return userId === currentUserId;
  };

  const isAllSelected = localUsers.length > 0 && selectedUsers.length === localUsers.length;
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < localUsers.length;

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Assigned Tenants
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Last Login
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
              {localUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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

                  {/* User - Name on top, Email below */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-neutral-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tenants - Show all tenant assignments with role info */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {(user as any).tenants && (user as any).tenants.length > 0 ? (
                        (user as any).tenants.slice(0, 4).map((tenant: any) => (
                          <div
                            key={tenant.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                            title={`${tenant.name} - Role: ${tenant.role_display_name || tenant.role_name}`}
                          >
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <div className="flex flex-col items-start">
                              <span className="font-semibold truncate max-w-[120px]">{tenant.name}</span>
                              <span className="text-[10px] text-blue-600 opacity-75">{tenant.role_display_name || tenant.role_name}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-neutral-400 italic">No tenant access</span>
                      )}
                      {(user as any).tenants && (user as any).tenants.length > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-lg border border-neutral-200">
                          +{(user as any).tenants.length - 4} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status - Switch Toggle */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => handleToggleStatus(user)}
                        disabled={togglingStatusId === user.id || isTrash || isCurrentUser(user)}
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
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-600">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : <span className="text-neutral-400 italic">Never</span>}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-600">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {isTrash ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(user.id)}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setHardDeletingId(user.id);
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
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => push(`users/${user.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => push(`users/${user.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => push(`users/${user.id}/roles`)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Manage Roles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => push(`users/${user.id}/preferences`)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Preferences
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              if (!isCurrentUser(user)) {
                                setDeletingId(user.id);
                                setShowDeleteDialog(true);
                              }
                            }}
                            disabled={isCurrentUser(user)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isCurrentUser(user) ? (
                              <>
                                <span className="line-through">Delete User</span>
                                <span className="ml-2 text-xs text-neutral-400">(Tidak bisa hapus akun sendiri)</span>
                              </>
                            ) : (
                              'Delete User'
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
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 whitespace-nowrap">Rows per page:</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  onLimitChange(Number(value));
                  onPageChange(1); // Reset to page 1 on limit change
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
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                }
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              User ini akan dipindahkan ke trash. Anda dapat memulihkannya nanti dari tab Trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
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
                User ini akan <span className="font-semibold text-red-600">dihapus secara permanen</span> dari database. 
                Semua data terkait user akan hilang dan tidak dapat dipulihkan.
              </p>
              <p className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                💡 <strong>Saran:</strong> Gunakan "Restore" jika Anda hanya ingin mengaktifkan kembali user ini.
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
    </>
  );
}
