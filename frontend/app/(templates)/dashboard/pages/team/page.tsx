'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Mail, MoreVertical, Crown, Shield, User as UserIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

/**
 * Team Management Page
 * Invite members, manage roles, and team settings
 */

export default function TeamManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const members = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Owner',
      avatar: 'JD',
      status: 'active',
      joinedDate: 'Jan 2023',
    },
    {
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      role: 'Admin',
      avatar: 'SS',
      status: 'active',
      joinedDate: 'Mar 2023',
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Member',
      avatar: 'MJ',
      status: 'active',
      joinedDate: 'Jun 2023',
    },
    {
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'Member',
      avatar: 'EW',
      status: 'invited',
      joinedDate: 'Pending',
    },
  ];

  const pendingInvites = [
    { email: 'alex@example.com', role: 'Member', sentDate: '2 days ago' },
    { email: 'lisa@example.com', role: 'Admin', sentDate: '5 days ago' },
  ];

  const roleColors = {
    Owner: 'from-amber-500 to-orange-600',
    Admin: 'from-purple-500 to-pink-600',
    Member: 'from-blue-500 to-cyan-600',
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-3">Team Management</h1>
              <p className="text-lg text-neutral-600">
                Manage your team members and their roles
              </p>
            </div>
            <Button variant="primary" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-600">Total Members</h3>
              <UserIcon className="w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">4</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-600">Admins</h3>
              <Shield className="w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">2</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-600">Active</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">3</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-600">Pending</h3>
              <Mail className="w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">2</p>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6"
        >
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members by name or email..."
                className="pl-12"
              />
            </div>
            <Select className="w-48">
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </Select>
          </div>
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900">Team Members</h2>
            <p className="text-sm text-neutral-600 mt-1">Manage your team members and their permissions</p>
          </div>

          <div className="divide-y divide-neutral-100">
            {members.map((member, index) => (
              <div key={index} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleColors[member.role as keyof typeof roleColors]} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {member.avatar}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900">{member.name}</h3>
                        {member.role === 'Owner' && (
                          <Crown className="w-4 h-4 text-amber-500" />
                        )}
                        {member.status === 'invited' && (
                          <Badge variant="secondary">Invited</Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Role Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="default">{member.role}</Badge>
                      <span className="text-xs text-neutral-500">Joined {member.joinedDate}</span>
                    </div>

                    {/* Actions */}
                    {member.role !== 'Owner' && (
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Pending Invites</h2>
              <p className="text-sm text-neutral-600 mt-1">Invitations waiting to be accepted</p>
            </div>

            <div className="divide-y divide-neutral-100">
              {pendingInvites.map((invite, index) => (
                <div key={index} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">{invite.email}</h3>
                        <p className="text-sm text-neutral-600">Invited as {invite.role} • {invite.sentDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Resend
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Roles & Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900">Roles & Permissions</h2>
            <p className="text-sm text-neutral-600 mt-1">Understanding team member permissions</p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Owner */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-900 mb-2">Owner</h3>
                  <p className="text-sm text-neutral-600 mb-3">Full access to all features and settings</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">All Permissions</Badge>
                    <Badge variant="secondary">Billing</Badge>
                    <Badge variant="secondary">Delete Team</Badge>
                  </div>
                </div>
              </div>

              {/* Admin */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-900 mb-2">Admin</h3>
                  <p className="text-sm text-neutral-600 mb-3">Can manage team members and projects</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Manage Members</Badge>
                    <Badge variant="secondary">Edit Projects</Badge>
                    <Badge variant="secondary">View Analytics</Badge>
                  </div>
                </div>
              </div>

              {/* Member */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-900 mb-2">Member</h3>
                  <p className="text-sm text-neutral-600 mb-3">Can view and edit assigned projects</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">View Projects</Badge>
                    <Badge variant="secondary">Edit Content</Badge>
                    <Badge variant="secondary">Comment</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
