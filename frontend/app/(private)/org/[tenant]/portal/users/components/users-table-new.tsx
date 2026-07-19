'use client';

import { useState } from 'react';
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
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await usersService.delete(id);
      toast.success('User berhasil dihapus');
      onRefetch();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast.error('Gagal menghapus user', {
        description: error?.response?.data?.message || error.message,
      });
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await usersService.restore(id);
      toast.success('User berhasil dipulihkan');
      onRefetch();
    } catch (error: any) {
      toast.error('Gagal memulihkan user', {
        description: error?.response?.data?.message || error.message,
      });
    }
  };

  const handleToggleStatus = async (user: User) => {
    setTogglingStatusId(user.id);
    try {
      if (user.is_active) {
        await usersService.deactivate(user.id);
        toast.success('User dinonaktifkan');
      } else {
        await usersService.activate(user.id);
        toast.success('User diaktifkan');
      }
      onRefetch();
    } catch (error: any) {
      toast.error('Gagal mengubah status user', {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectUsers(users.map(u => u.id));
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

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

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
                  Tenants
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
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((user, index) => (
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

                  {/* Tenants - Show all tenant badges */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(user as any).tenants && (user as any).tenants.length > 0 ? (
                        (user as any).tenants.slice(0, 3).map((tenant: any) => (
                          <span
                            key={tenant.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md"
                            title={tenant.name}
                          >
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{tenant.name}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-neutral-400">No tenants</span>
                      )}
                      {(user as any).tenants && (user as any).tenants.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">
                          +{(user as any).tenants.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(user as any).roles && (user as any).roles.length > 0 ? (
                        (user as any).roles.map((role: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 text-xs font-medium rounded-md ${
                              role === 'No Role'
                                ? 'bg-neutral-100 text-neutral-500'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-neutral-400">No roles</span>
                      )}
                    </div>
                  </td>

                  {/* Status - Switch Toggle */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => handleToggleStatus(user)}
                        disabled={togglingStatusId === user.id || isTrash}
                      />
                      <span className={`text-sm font-medium ${
                        user.is_active ? 'text-green-600' : 'text-neutral-400'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
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
                        : 'Never'}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {isTrash ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(user.id)}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
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
                              setDeletingId(user.id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
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
          <div className="text-sm text-neutral-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
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
    </>
  );
}
