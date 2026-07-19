'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, TestTube, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface GoogleDriveConfigProps {
  settings: any;
  onSave: (value: any) => void;
  saving: boolean;
}

export function GoogleDriveConfig({ settings, onSave, saving }: GoogleDriveConfigProps) {
  const [folderId, setFolderId] = useState(settings?.google_drive?.folder_id || '');
  const [folderName, setFolderName] = useState(settings?.google_drive?.folder_name || 'Platform CMS Uploads');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/upload/test/google-drive');
      const data = await response.json();

      setTestResult(data);

      if (data.success) {
        toast.success('Koneksi Google Drive berhasil!', {
          description: data.message,
        });
      } else {
        toast.error('Koneksi Google Drive gagal', {
          description: data.message,
        });
      }
    } catch (error: any) {
      toast.error('Gagal test koneksi', {
        description: error.message,
      });
      setTestResult({ success: false });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      folder_id: folderId,
      folder_name: folderName,
      credentials_path: settings?.google_drive?.credentials_path,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
          <FolderOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">
            Google Drive Configuration
          </h3>
          <p className="text-sm text-neutral-600">
            Konfigurasi folder dan credentials Google Drive
          </p>
        </div>
      </div>

      {/* Connection Status */}
      {testResult && (
        <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${
          testResult.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {testResult.success ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <X className="w-5 h-5 text-red-600" />
          )}
          <div className="flex-1">
            <p className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {testResult.success ? 'Koneksi Berhasil' : 'Koneksi Gagal'}
            </p>
            <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="folder-id">Folder ID</Label>
          <Input
            id="folder-id"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            placeholder="1Gme-I7SGysZW9ujIxLHfOIqgJBGNiRgN"
            className="mt-1"
          />
          <p className="text-xs text-neutral-500 mt-1">
            ID folder Google Drive untuk menyimpan upload
          </p>
        </div>

        <div>
          <Label htmlFor="folder-name">Folder Name</Label>
          <Input
            id="folder-name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Platform CMS Uploads"
            className="mt-1"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Nama folder untuk identifikasi
          </p>
        </div>

        {/* Credentials Info */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold mb-1">
            OAuth2 Credentials
          </p>
          <p className="text-xs text-blue-700">
            Credentials dikonfigurasi via environment variable (.env)
          </p>
          <code className="text-xs text-blue-600 mt-2 block">
            GOOGLE_DRIVE_REFRESH_TOKEN=***
          </code>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={testing}
          className="gap-2"
        >
          <TestTube className="w-4 h-4" />
          {testing ? 'Testing...' : 'Test Koneksi'}
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30"
        >
          {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </Button>
      </div>
    </motion.div>
  );
}
