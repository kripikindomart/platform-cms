'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, FileImage, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LimitsConfigProps {
  settings: any;
  onSave: (value: any) => void;
  saving: boolean;
}

export function LimitsConfig({ settings, onSave, saving }: LimitsConfigProps) {
  const [maxImageSize, setMaxImageSize] = useState(settings?.limits?.max_image_size_mb || 5);
  const [maxFileSize, setMaxFileSize] = useState(settings?.limits?.max_file_size_mb || 10);
  const [imageTypes, setImageTypes] = useState(
    settings?.limits?.allowed_image_types?.join(', ') || 'jpeg, png, gif, webp, svg'
  );
  const [documentTypes, setDocumentTypes] = useState(
    settings?.limits?.allowed_document_types?.join(', ') || 'pdf, doc, docx, xls, xlsx'
  );

  const handleSave = () => {
    onSave({
      max_image_size_mb: Number(maxImageSize),
      max_file_size_mb: Number(maxFileSize),
      allowed_image_types: imageTypes.split(',').map((t: string) => t.trim()),
      allowed_document_types: documentTypes.split(',').map((t: string) => t.trim()),
    });
  };

  return (
    <div className="space-y-6">
      {/* Image Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <FileImage className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">
              Image Settings
            </h3>
            <p className="text-sm text-neutral-600">
              Batasan untuk file gambar
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="max-image-size">Max Image Size (MB)</Label>
            <Input
              id="max-image-size"
              type="number"
              value={maxImageSize}
              onChange={(e) => setMaxImageSize(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="image-types">Allowed Image Types</Label>
            <Input
              id="image-types"
              value={imageTypes}
              onChange={(e) => setImageTypes(e.target.value)}
              placeholder="jpeg, png, gif, webp, svg"
              className="mt-1"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Pisahkan dengan koma
            </p>
          </div>
        </div>
      </motion.div>

      {/* Document Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">
              Document Settings
            </h3>
            <p className="text-sm text-neutral-600">
              Batasan untuk file dokumen
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="max-file-size">Max Document Size (MB)</Label>
            <Input
              id="max-file-size"
              type="number"
              value={maxFileSize}
              onChange={(e) => setMaxFileSize(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="document-types">Allowed Document Types</Label>
            <Input
              id="document-types"
              value={documentTypes}
              onChange={(e) => setDocumentTypes(e.target.value)}
              placeholder="pdf, doc, docx, xls, xlsx"
              className="mt-1"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Pisahkan dengan koma
            </p>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  );
}
