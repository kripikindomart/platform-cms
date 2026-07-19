'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Role } from '@/lib/api/types';
import { rolesService } from '@/lib/api/services/roles.service';
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

interface RolesTableProps {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefetch: () => void;
}

export function RolesTable({
  roles,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  onRefetch,
}: RolesTableProps) {
  const { push } = usePortalRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      await rolesService.delete(id);
      toast.success('Role deleted successfully');
      onRefetch();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast.error('Failed to delete role', {
        description: error?.response?.data?.message || error.message,
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Identifier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  System
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {roles?.map((role, index) => (
                <motion.tr
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  {/* Role */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">
                          {role.display_name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          ID: {role.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Identifier */}
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono text-neutral-700">
                      {role.name}
                    </code>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-600 max-w-xs truncate">
                      {role.description || '-'}
                    </div>
                  </td>

                  {/* Permissions */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900 font-medium">
                      {role.permissions?.length || 0} permissions
                    </div>
                  </td>

                  {/* System Role */}
                  <td className="px-6 py-4">
                    {role.is_system ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" />
                        System
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-400">Custom</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => push(`roles/${role.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => push(`roles/${role.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => push(`roles/${role.id}/permissions`)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Manage Permissions
                        </DropdownMenuItem>
                        {!role.is_system && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingId(role.id);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Role
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} roles
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this role and remove it from all users. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
