'use client';

import { motion } from 'framer-motion';
import { MoreVertical, Mail, Phone, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  joinedAt: string;
}

export interface RecentUsersProps {
  users?: User[];
  maxUsers?: number;
  className?: string;
}

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    initials: 'JD',
    role: 'Admin',
    status: 'online',
    joinedAt: '2 mins ago',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    initials: 'JS',
    role: 'Editor',
    status: 'online',
    joinedAt: '15 mins ago',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@company.com',
    initials: 'BJ',
    role: 'Viewer',
    status: 'away',
    joinedAt: '1 hour ago',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@company.com',
    initials: 'AW',
    role: 'Editor',
    status: 'offline',
    joinedAt: '3 hours ago',
  },
];

const statusConfig = {
  online: 'bg-green-500',
  offline: 'bg-neutral-400',
  away: 'bg-amber-500',
};

export function RecentUsers({
  users = defaultUsers,
  maxUsers = 5,
  className,
}: RecentUsersProps) {
  const displayedUsers = users.slice(0, maxUsers);

  return (
    <div className={cn('p-6 bg-white rounded-2xl border border-neutral-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-neutral-900">Recent Users</h3>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          View All
        </button>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {displayedUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
          >
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.initials}
                </div>
              )}
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
                  statusConfig[user.status]
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {user.name}
                </p>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{user.joinedAt}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <Mail className="w-4 h-4 text-neutral-600" />
              </button>
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {displayedUsers.length === 0 && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-900 mb-1">No users yet</p>
          <p className="text-sm text-neutral-500">Users will appear here</p>
        </div>
      )}
    </div>
  );
}
