'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import { PortalLink } from '@/components/ui/portal-link';
import { rolesService } from '@/lib/api/services/roles.service';
import { Role, Permission } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { usePortalRouter } from '@/hooks/use-portal-router';

export default function ManageRolePermissionsPage() {
  const { push } = usePortalRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<string>('all');

  // Selected permission IDs
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roleData = await rolesService.getById(Number(roleId));
        setRole(roleData);
        
        // Initialize selected permissions
        const initialSelected = new Set(roleData.permissions?.map(p => p.id) || []);
        setSelectedPermissions(initialSelected);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const response = await rolesService.getAllPermissions({ limit: 1000 });
        setAllPermissions(response.data);
      } catch (err: any) {
        toast.error('Failed to load permissions');
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handleTogglePermission = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await rolesService.assignPermissions(Number(roleId), {
        permission_ids: Array.from(selectedPermissions),
      });
      toast.success('Permissions berhasil diperbarui', {
        closeButton: true,
        duration: 3000,
      });
      push(`/roles/${roleId}`);
    } catch (error: any) {
      toast.error('Gagal memperbarui permissions', {
        description: error?.response?.data?.message || error.message,
        closeButton: true,
        duration: 5000,
      });
      setSaving(false);
    }
  };

  // Group permissions by resource
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter permissions
  const filteredResources = Object.entries(groupedPermissions).filter(([resource, permissions]) => {
    if (selectedResource !== 'all' && resource !== selectedResource) {
      return false;
    }
    if (searchQuery) {
      return permissions.some(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const resources = Object.keys(groupedPermissions);

  if (loading || permissionsLoading) {
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PortalLink href={`/roles/${roleId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role
          </Button>
        </PortalLink>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Manage Permissions</h1>
            <p className="text-neutral-600 mt-0.5">
              Assign or remove permissions for <strong>{role.display_name}</strong>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="h-12 px-4 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none"
          >
            <option value="all">All Resources</option>
            {resources.map(resource => (
              <option key={resource} value={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </option>
            ))}
          </select>

          <div className="text-sm text-neutral-600 font-medium px-4 py-2 bg-purple-50 rounded-xl">
            {selectedPermissions.size} selected
          </div>
        </div>
      </motion.div>

      {/* Permissions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
            <div className="text-neutral-400 mb-2">No permissions found</div>
            <p className="text-sm text-neutral-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredResources.map(([resource, permissions]) => (
            <div
              key={resource}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900 capitalize">
                  {resource} Permissions
                </h3>
                <span className="text-sm text-neutral-500">
                  {permissions.filter(p => selectedPermissions.has(p.id)).length} / {permissions.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {permissions
                  .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((permission) => (
                    <div
                      key={permission.id}
                      onClick={() => handleTogglePermission(permission.id)}
                      className={`
                        p-4 border rounded-xl cursor-pointer transition-all
                        ${selectedPermissions.has(permission.id)
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-neutral-200 hover:border-purple-200 hover:bg-purple-50/50'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedPermissions.has(permission.id)}
                          onCheckedChange={() => handleTogglePermission(permission.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-neutral-900 truncate">
                            {permission.name}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {permission.action}
                          </div>
                          {permission.description && (
                            <div className="text-xs text-neutral-400 mt-1 line-clamp-2">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 rounded-t-2xl shadow-lg">
        <div className="flex justify-end gap-3">
          <PortalLink href={`/roles/${roleId}`}>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
            >
              Cancel
            </Button>
          </PortalLink>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
