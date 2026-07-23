'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Trash2, Eye, RefreshCw, Edit, Zap } from 'lucide-react';
import { useModuleGenerator, type ModuleListItem } from '@/hooks/use-module-generator';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface ModuleListProps {
  modules: ModuleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefetch: () => void;
}

export function ModuleList({
  modules,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  onRefetch,
}: ModuleListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const { deleteModule, loading } = useModuleGenerator();
  const { push } = usePortalRouter();

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteModule(deleteId);
    setDeleteId(null);
    onRefetch();
  };

  const handleRegenerate = async (moduleId: number) => {
    setRegeneratingId(moduleId);
    
    try {
      // Get current tenant from URL path
      const pathSegments = window.location.pathname.split('/');
      const tenantSlug = pathSegments[2]; // /org/{tenant}/portal/...
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/module-generator/${moduleId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
          'X-Tenant-Slug': tenantSlug,
        },
        credentials: 'include',
        body: JSON.stringify({
          options: {
            autoPublish: true,
            generateMenu: true,
            createPermissions: true,
            runMigration: true,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to regenerate module');
      }

      const result = await response.json();
      
      toast.success('Module regenerated successfully!', {
        description: `Generated ${result.data?.filesCreated || 'all'} files with latest templates.`
      });
      
      onRefetch();
    } catch (error: any) {
      toast.error('Failed to regenerate module', {
        description: error.message
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  if (modules.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
        <p className="text-neutral-600 font-medium mb-2">Belum ada module yang di-generate</p>
        <p className="text-sm text-neutral-500">
          Klik &quot;Generate Module&quot; untuk membuat module baru
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50/50">
              <TableHead className="font-semibold">Module Name</TableHead>
              <TableHead className="font-semibold">Display Name</TableHead>
              <TableHead className="font-semibold">Fields</TableHead>
              <TableHead className="font-semibold">Permissions</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
              <TableHead className="font-semibold">Created By</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module) => (
              <TableRow key={module.id} className="hover:bg-neutral-50/50 transition-colors">
                <TableCell className="font-mono text-sm font-medium text-blue-600">
                  {module.moduleName}
                </TableCell>
                <TableCell className="font-medium">{module.displayName}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium">
                    {module.fieldsCount} fields
                  </Badge>
                </TableCell>
                <TableCell>
                  {module.permissionsCount > 0 ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        {module.permissionsCount}
                      </Badge>
                      <span className="text-xs text-neutral-500">permissions</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">No permissions</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-neutral-600">
                  {format(new Date(module.createdAt), 'dd MMM yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-sm">
                  {module.createdBy?.name ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                        {module.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-neutral-700">{module.createdBy.name}</span>
                    </div>
                  ) : (
                    <span className="text-neutral-400 italic">System</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => push(`/module-builder/${module.id}/form-builder`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => push(`/module-builder/${module.id}/assign`)}>
                        <Zap className="mr-2 h-4 w-4" />
                        Assign to Tenant
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRegenerate(module.id)}
                        disabled={regeneratingId === module.id}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${regeneratingId === module.id ? 'animate-spin' : ''}`} />
                        {regeneratingId === module.id ? 'Regenerating...' : 'Regenerate Code'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(module.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
            <div className="text-sm text-neutral-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} modules
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={page === pageNum ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Hapus Module?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-600 mt-2">
              Module akan dihapus secara permanen dari database. Generated files di folder backend akan tetap ada dan perlu dihapus manual jika diperlukan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="mr-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Module
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
