'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalLink } from '@/components/ui/portal-link';
import { RoleForm } from '../components/role-form';
import { rolesService, CreateRoleDTO } from '@/lib/api/services/roles.service';
import { toast } from 'sonner';
import { usePortalRouter } from '@/hooks/use-portal-router';

export default function CreateRolePage() {
  const { push } = usePortalRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateRoleDTO) => {
    try {
      setLoading(true);
      await rolesService.create(data);
      toast.success('Role berhasil dibuat', {
        closeButton: true,
        duration: 3000,
      });
      push('/roles');
    } catch (error: any) {
      toast.error('Gagal membuat role', {
        description: error?.response?.data?.message || error.message,
        closeButton: true,
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
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

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Create New Role</h1>
            <p className="text-neutral-600 mt-0.5">
              Add a new role with custom permissions
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
        <RoleForm onSubmit={handleSubmit} loading={loading} />
      </motion.div>
    </div>
  );
}
