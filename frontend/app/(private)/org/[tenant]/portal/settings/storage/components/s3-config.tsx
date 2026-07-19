'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface S3ConfigProps {
  settings: any;
  onSave: (value: any) => void;
  saving: boolean;
}

export function S3Config({ settings, onSave, saving }: S3ConfigProps) {
  const [bucket, setBucket] = useState(settings?.s3?.bucket || '');
  const [region, setRegion] = useState(settings?.s3?.region || 'us-east-1');
  const [endpoint, setEndpoint] = useState(settings?.s3?.endpoint || '');

  const handleSave = () => {
    onSave({
      bucket,
      region,
      endpoint,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Server className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">
            S3 Configuration
          </h3>
          <p className="text-sm text-neutral-600">
            Konfigurasi AWS S3 atau S3-compatible storage
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="bucket">Bucket Name</Label>
          <Input
            id="bucket"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            placeholder="platform-cms-uploads"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="us-east-1"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="endpoint">Endpoint (Optional)</Label>
          <Input
            id="endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://s3.amazonaws.com"
            className="mt-1"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Untuk S3-compatible storage (MinIO, DigitalOcean Spaces, dll)
          </p>
        </div>

        {/* Credentials Info */}
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-sm text-orange-900 font-semibold mb-1">
            AWS Credentials
          </p>
          <p className="text-xs text-orange-700 mb-2">
            Credentials dikonfigurasi via environment variable (.env)
          </p>
          <div className="space-y-1">
            <code className="text-xs text-orange-600 block">
              AWS_ACCESS_KEY_ID=***
            </code>
            <code className="text-xs text-orange-600 block">
              AWS_SECRET_ACCESS_KEY=***
            </code>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end pt-4 border-t border-neutral-200">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/30"
        >
          {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </Button>
      </div>
    </motion.div>
  );
}
