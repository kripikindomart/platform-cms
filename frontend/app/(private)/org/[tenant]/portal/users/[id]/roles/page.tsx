'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { PortalLink } from '@/components/ui/portal-link';
import { useUser } from '@/hooks/use-users';
import { Skeleton } from '@/components/ui/skeleton';
import { usersService } from '@/lib/api/services/users.service';
import { rolesService, Role } from '@/lib/api/services/roles.service';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';

export default function ManageUserRolesPage() {
  const params = useParams();
  const userId = params.id as string;

  const { user, loading: userLoading, error: userError, refetch } = useUser(userId);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Fetch all available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await rolesService.getAll({ limit: 100 });
        setAllRoles(response.data);
      } catch (error: any) {
        toast.error('Failed to load roles', {
          description: error?.response?.data?.message || error.message,
        });
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedRoleId || !user) return;

    try {
      setAssigning(true);
      await usersService.assignRoles(user.id, {
        role_ids: [Number(selectedRoleId)],
      });
      toast.success('Role assigned successfully');
      setSelectedRoleId('');
      refetch();
    } catch (error: any) {
      toast.error('Failed to assign role', {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!user) return;

    try {
      setRemovingId(roleId);
      await usersService.removeRole(user.id, roleId);
      toast.success('Role removed successfully');
      refetch();
    } catch (error: any) {
      toast.error('Failed to remove role', {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setRemovingId(null);
    }
  };

  // Get roles that are not yet assigned
  const availableRoles = allRoles.filter(
    (role) => !user?.roles?.some((ur) => ur.id === role.id)
  );

  if (userLoading || rolesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          <div className="text-red-600 font-semibold mb-2">Failed to load user</div>
          <p className="text-sm text-neutral-600 mb-4">{userError || 'User not found'}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PortalLink href={`/users/${userId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User
          </Button>
        </PortalLink>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Manage Roles</h1>
            <p className="text-neutral-600 mt-0.5">
              Assign or remove roles for {user.email}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              Current Roles ({user.roles?.length || 0})
            </h2>

            {user.roles && user.roles.length > 0 ? (
              <div className="space-y-3">
                {user.roles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-neutral-500 mt-0.5">{role.description}</div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRole(role.id)}
                      disabled={removingId === role.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {removingId === role.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <Shield className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No roles assigned yet</p>
                <p className="text-xs mt-1">Assign a role from the available roles</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Assign New Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Assign New Role</h2>

            {availableRoles.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">
                    Select Role
                  </label>
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            {role.description && (
                              <div className="text-xs text-neutral-500">{role.description}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAssignRole}
                  disabled={!selectedRoleId || assigning}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Role
                    </>
                  )}
                </Button>

                {/* Available Roles Preview */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="text-sm font-medium text-neutral-700 mb-3">
                    Available Roles ({availableRoles.length})
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableRoles.map((role) => (
                      <div
                        key={role.id}
                        className="p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedRoleId(role.id.toString())}
                      >
                        <div className="font-medium text-sm text-neutral-900">{role.name}</div>
                        {role.description && (
                          <div className="text-xs text-neutral-500 mt-0.5">{role.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <Shield className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">All roles assigned</p>
                <p className="text-xs mt-1">This user has all available roles</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
