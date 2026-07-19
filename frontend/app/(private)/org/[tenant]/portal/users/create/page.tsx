'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserForm } from '../components/user-form';
import { PortalLink } from '@/components/ui/portal-link';
import { usePortalRouter } from '@/hooks/use-portal-router';

export default function CreateUserPage() {
  const { push } = usePortalRouter();

  const handleSuccess = () => {
    push('/users');
  };

  return (
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

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Create New User</h1>
            <p className="text-neutral-600 mt-0.5">
              Add a new user to your organization
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
        <UserForm onSuccess={handleSuccess} />
      </motion.div>
    </div>
  );
}
