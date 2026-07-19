'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Building2,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { PortalLink } from '@/components/ui/portal-link';
import { useUser } from '@/hooks/use-users';
import { Skeleton } from '@/components/ui/skeleton';
import { usersService } from '@/lib/api/services/users.service';
import { toast } from 'sonner';
import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';

export default function UserDetailPage() {
  const { push } = usePortalRouter();
  const params = useParams();
  const userId = params.id as string;

  const { user, loading, error, refetch } = useUser(userId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await usersService.delete(Number(userId));
      toast.success('User berhasil dihapus', {
        duration: 3000,
        closeButton: true,
      });
      push('../'); // Navigate back to users list
    } catch (error: any) {
      toast.error('Gagal menghapus user', {
        description: error?.response?.data?.message || error.message,
        duration: 5000,
        closeButton: true,
      });
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    try {
      setToggling(true);
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
      refetch();
    } catch (error: any) {
      toast.error('Gagal mengubah status user', {
        description: error?.response?.data?.message || error.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-red-600 font-semibold mb-2">Failed to load user</div>
          <p className="text-sm text-neutral-600 mb-4">{error || 'User not found'}</p>
          <PortalLink href="/users">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
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
          <PortalLink href="/users">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </PortalLink>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </div>
              )}
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  {user.name || 'No Name'}
                </h1>
                <p className="text-neutral-600 mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {/* Active Status */}
                  {user.is_active ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                  
                  {/* Verified Status */}
                  {user.is_verified ? (
                    <Badge variant="default" className="bg-blue-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                  
                  {/* Must Change Password */}
                  {user.must_change_password && (
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      <Key className="w-3 h-3 mr-1" />
                      Must Change Password
                    </Badge>
                  )}
                  
                  {/* Deleted Status */}
                  {user.deleted_at && (
                    <Badge variant="destructive">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Deleted
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                disabled={toggling}
              >
                {user.is_active ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <PortalLink href={`/users/${userId}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </PortalLink>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-500">Full Name</label>
                  <div className="text-base font-semibold text-neutral-900">
                    {user.name || '-'}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-500">Email Address</label>
                  <div className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    {user.email}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-500">Phone Number</label>
                  <div className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    {user.phone || '-'}
                  </div>
                </div>

                {/* ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-500">User ID</label>
                  <div className="text-base font-mono text-neutral-900">
                    #{user.id}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Account Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Account Activity
              </h2>
              
              <div className="space-y-4">
                {/* Last Login */}
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-500">Last Login</div>
                    <div className="font-semibold text-neutral-900 mt-1">
                      {user.last_login_at ? (
                        <>
                          {new Date(user.last_login_at).toLocaleString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {user.last_login_ip && (
                            <div className="text-xs text-neutral-500 mt-1">
                              From: {user.last_login_ip}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-neutral-400">Never logged in</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-500">Member Since</div>
                    <div className="font-semibold text-neutral-900 mt-1">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-500">Last Updated</div>
                    <div className="font-semibold text-neutral-900 mt-1">
                      {new Date(user.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Password Changed */}
                {user.password_changed_at && (
                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Key className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-500">Password Changed</div>
                      <div className="font-semibold text-neutral-900 mt-1">
                        {new Date(user.password_changed_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Assigned Tenants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Assigned Tenants
              </h2>

              {(user as any).tenants && (user as any).tenants.length > 0 ? (
                <div className="space-y-3">
                  {(user as any).tenants.map((tenant: any) => (
                    <div
                      key={tenant.id}
                      className="p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900 truncate">
                            {tenant.name}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {tenant.slug}
                          </div>
                          <Badge variant="outline" className="mt-2">
                            {tenant.role_display_name || tenant.role_name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tenant access</p>
                </div>
              )}
            </motion.div>

            {/* Security Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Security Status
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Account Status</span>
                  {user.is_active ? (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Email Verified</span>
                  {user.is_verified ? (
                    <Badge variant="default" className="bg-blue-500">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Must Change Password</span>
                  {user.must_change_password ? (
                    <Badge variant="outline" className="border-orange-300 text-orange-700">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Audit Info */}
            {(user.created_by || user.updated_by || user.deleted_by) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
              >
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Audit Information</h2>

                <div className="space-y-3 text-sm">
                  {user.created_by && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Created By</span>
                      <span className="font-medium text-neutral-900">User #{user.created_by}</span>
                    </div>
                  )}
                  {user.updated_by && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Updated By</span>
                      <span className="font-medium text-neutral-900">User #{user.updated_by}</span>
                    </div>
                  )}
                  {user.deleted_by && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Deleted By</span>
                      <span className="font-medium text-neutral-900">User #{user.deleted_by}</span>
                    </div>
                  )}
                  {user.deleted_at && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Deleted At</span>
                      <span className="font-medium text-neutral-900">
                        {new Date(user.deleted_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus user ini?</AlertDialogTitle>
            <AlertDialogDescription>
              User <strong>{user.name || user.email}</strong> akan dipindahkan ke trash.
              Anda dapat memulihkannya nanti dari tab Trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Menghapus...' : 'Hapus User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
