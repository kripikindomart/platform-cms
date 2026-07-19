'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RolesTable } from './components/roles-table';
import { useRoles } from '@/hooks/use-roles';
import { Skeleton } from '@/components/ui/skeleton';
import { PortalLink } from '@/components/ui/portal-link';
import { usePortalRouter } from '@/hooks/use-portal-router';

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { roles, loading, error, pagination, fetchRoles } = useRoles();

  // Fetch roles on mount and when filters change
  useEffect(() => {
    fetchRoles({ page, limit, search: searchQuery });
  }, [page, limit, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Role Management</h1>
            <p className="text-neutral-600 mt-0.5">
              {loading ? 'Loading...' : `${pagination.total} total roles`}
            </p>
          </div>
        </div>

        <PortalLink href="roles/create">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </PortalLink>
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
              placeholder="Search roles by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
            <div className="text-red-600 font-semibold mb-2">Failed to load roles</div>
            <p className="text-sm text-neutral-600 mb-4">{error.message}</p>
            <Button onClick={() => fetchRoles({ page, limit })} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <RolesTable
            roles={roles}
            total={pagination.total}
            page={page}
            limit={limit}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onRefetch={() => fetchRoles({ page, limit })}
          />
        )}
      </motion.div>
    </div>
  );
}
