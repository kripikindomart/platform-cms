'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Search, Filter, Image, FileText, Video, Music, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadSettingsTable } from './components/upload-settings-table';
import { useUploadSettings } from '@/hooks/use-upload-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { PortalLink } from '@/components/ui/portal-link';

const categoryIcons = {
  image: Image,
  document: FileText,
  video: Video,
  audio: Music,
  other: File,
};

export default function UploadSettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { uploadSettings, loading, error, pagination, fetchUploadSettings } = useUploadSettings();

  // Fetch settings on mount and when filters change
  useEffect(() => {
    fetchUploadSettings({ page, limit, search: searchQuery });
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Upload Settings</h1>
            <p className="text-neutral-600 mt-0.5">
              {loading ? 'Loading...' : `Manage file upload URL formats by category`}
            </p>
          </div>
        </div>

        <PortalLink href="upload-settings/create">
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Setting
          </Button>
        </PortalLink>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        {Object.entries(categoryIcons).map(([category, Icon]) => (
          <div
            key={category}
            className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase">{category}</div>
                <div className="text-sm font-semibold text-neutral-900">
                  {uploadSettings.find(s => s.category === category)?.url_format || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search by category or format..."
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
        transition={{ delay: 0.3 }}
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
            <div className="text-red-600 font-semibold mb-2">Failed to load settings</div>
            <p className="text-sm text-neutral-600 mb-4">{error.message}</p>
            <Button onClick={() => fetchUploadSettings({ page, limit })} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <UploadSettingsTable
            settings={uploadSettings}
            total={pagination.total}
            page={page}
            limit={limit}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onRefetch={() => fetchUploadSettings({ page, limit })}
          />
        )}
      </motion.div>
    </div>
  );
}
