'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserForm } from '../../components/user-form';
import { useParams } from 'next/navigation';
import { PortalLink } from '@/components/ui/portal-link';
import { useUser } from '@/hooks/use-users';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalRouter } from '@/hooks/use-portal-router';

export default function EditUserPage() {
  const { push } = usePortalRouter();
  const params = useParams();
  const userId = params.id as string;

  const { user, loading, error } = useUser(userId);

  const handleSuccess = () => {
    push('/users');
  };

  const handleCancel = () => {
    push(`/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
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
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Edit User</h1>
            <p className="text-neutral-600 mt-0.5">
              Update user information for {user.email}
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
        <UserForm user={user} onSuccess={handleSuccess} onCancel={handleCancel} />
      </motion.div>
    </div>
  );
}
