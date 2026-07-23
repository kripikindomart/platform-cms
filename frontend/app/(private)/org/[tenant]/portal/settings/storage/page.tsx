'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive,
  Cloud,
  Server,
  FolderOpen,
  Settings as SettingsIcon,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ProviderSelector } from './components/provider-selector';
import { GoogleDriveConfig } from './components/google-drive-config';
import { S3Config } from './components/s3-config';
import { LimitsConfig } from './components/limits-config';
import { StorageStats } from './components/storage-stats';

export default function StorageSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('provider');

  // Fetch storage settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/storage');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error: any) {
      toast.error('Gagal memuat pengaturan storage', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: string, value: any) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/settings/storage/${category}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Pengaturan berhasil disimpan', {
          duration: 3000,
        });
        fetchSettings();
      } else {
        throw new Error(data.message || 'Gagal menyimpan');
      }
    } catch (error: any) {
      toast.error('Gagal menyimpan pengaturan', {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-neutral-700">
              Storage Active
            </span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HardDrive className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Storage Settings
              </h1>
              <p className="text-neutral-600 mt-1">
                Kelola konfigurasi penyimpanan file dan upload
              </p>
            </div>
          </div>

          {/* Storage Stats */}
          <StorageStats settings={settings} />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white border border-neutral-200">
              <TabsTrigger value="provider" className="gap-2">
                <Cloud className="w-4 h-4" />
                Provider
              </TabsTrigger>
              <TabsTrigger value="folders" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Folders
              </TabsTrigger>
              <TabsTrigger value="s3" className="gap-2">
                <Server className="w-4 h-4" />
                S3
              </TabsTrigger>
              <TabsTrigger value="limits" className="gap-2">
                <SettingsIcon className="w-4 h-4" />
                Limits
              </TabsTrigger>
            </TabsList>

            {/* Provider Tab */}
            <TabsContent value="provider" className="mt-6 space-y-6">
              <ProviderSelector
                settings={settings}
                onSave={(value: any) => handleSave('provider', value)}
                saving={saving}
              />

              {settings?.provider?.active_provider === 'google-drive' && (
                <GoogleDriveConfig
                  settings={settings}
                  onSave={(value: any) => handleSave('google-drive', value)}
                  saving={saving}
                />
              )}
            </TabsContent>

            {/* Folders Tab */}
            <TabsContent value="folders" className="mt-6">
              <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Folder Structure
                </h3>
                <p className="text-neutral-600">
                  Folder management akan ditambahkan di fase berikutnya
                </p>
              </div>
            </TabsContent>

            {/* S3 Tab */}
            <TabsContent value="s3" className="mt-6">
              <S3Config
                settings={settings}
                onSave={(value: any) => handleSave('s3', value)}
                saving={saving}
              />
            </TabsContent>

            {/* Limits Tab */}
            <TabsContent value="limits" className="mt-6">
              <LimitsConfig
                settings={settings}
                onSave={(value: any) => handleSave('limits', value)}
                saving={saving}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
