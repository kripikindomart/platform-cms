'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Edit, 
  Trash2,
  CheckCircle2,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { PortalLink } from '@/components/ui/portal-link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { rolesService } from '@/lib/api/services/roles.service';
import { toast } from 'sonner';
import { Role } from '@/lib/api/types';
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

export default function RoleDetailPage() {
  const { push } = usePortalRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        const data = await rolesService.getById(Number(roleId));
        setRole(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await rolesService.delete(Number(roleId));
      toast.success('Role berhasil dihapus', {
        closeButton: true,
        duration: 3000,
      });
      push('/roles');
    } catch (error: any) {
      toast.error('Gagal menghapus role', {
        description: error?.response?.data?.message || error.message,
        closeButton: true,
        duration: 5000,
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          <div className="text-red-600 font-semibold mb-2">Failed to load role</div>
          <p className="text-sm text-neutral-600 mb-4">{error || 'Role not found'}</p>
          <PortalLink href="/roles">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roles
            </Button>
          </PortalLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PortalLink href="/roles">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roles
            </Button>
          </PortalLink>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  {role.display_name}
                </h1>
                <p className="text-neutral-600 mt-1">
                  <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono">
                    {role.name}
                  </code>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {role.is_system && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" />
                      System Role
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PortalLink href={`/roles/${roleId}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </PortalLink>
              {!role.is_system && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Role Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Description</h2>
              
              {role.description ? (
                <p className="text-neutral-600 leading-relaxed">{role.description}</p>
              ) : (
                <p className="text-neutral-400 italic">No description provided</p>
              )}

              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-neutral-500 mb-1">Created</div>
                    <div className="font-semibold text-neutral-900">
                      {new Date(role.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500 mb-1">Last Updated</div>
                    <div className="font-semibold text-neutral-900">
                      {new Date(role.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Permissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900">Permissions</h2>
                <PortalLink href={`/roles/${roleId}/permissions`}>
                  <Button variant="ghost" size="sm">
                    <Key className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                </PortalLink>
              </div>

              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                  <Key className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  {role.permissions?.length || 0}
                </div>
                <div className="text-sm text-neutral-500">Total Permissions</div>
              </div>

              {role.permissions && role.permissions.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {role.permissions.slice(0, 5).map((permission) => (
                    <div
                      key={permission.id}
                      className="p-3 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <div className="text-sm font-semibold text-neutral-900">
                        {permission.name}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {permission.resource} • {permission.action}
                      </div>
                    </div>
                  ))}
                  {role.permissions.length > 5 && (
                    <PortalLink href={`/roles/${roleId}/permissions`}>
                      <div className="text-center py-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                        View all {role.permissions.length} permissions →
                      </div>
                    </PortalLink>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role <strong>{role.name}</strong> and remove it from all users.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
