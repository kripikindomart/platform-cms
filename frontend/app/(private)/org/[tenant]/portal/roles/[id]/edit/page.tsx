'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { PortalLink } from '@/components/ui/portal-link';
import { RoleForm } from '../../components/role-form';
import { rolesService, UpdateRoleDTO } from '@/lib/api/services/roles.service';
import { toast } from 'sonner';
import { Role } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalRouter } from '@/hooks/use-portal-router';

export default function EditRolePage() {
  const { push } = usePortalRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (data: UpdateRoleDTO) => {
    try {
      setSubmitting(true);
      await rolesService.update(Number(roleId), data);
      toast.success('Role berhasil diperbarui', {
        closeButton: true,
        duration: 3000,
      });
      push(`/roles/${roleId}`);
    } catch (error: any) {
      toast.error('Gagal memperbarui role', {
        description: error?.response?.data?.message || error.message,
        closeButton: true,
        duration: 5000,
      });
      setSubmitting(false);
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
            <h1 className="text-3xl font-bold text-neutral-900">Edit Role</h1>
            <p className="text-neutral-600 mt-0.5">
              Update role information and settings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <RoleForm 
          initialData={role} 
          onSubmit={handleSubmit} 
          loading={submitting} 
        />
      </motion.div>
    </div>
  );
}
