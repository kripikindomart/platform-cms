'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadSettingsService, UploadSetting } from '@/lib/api/services/upload-settings.service';
import { toast } from 'sonner';
import { PortalLink } from '@/components/ui/portal-link';
import { usePortalRouter } from '@/hooks/use-portal-router';

const urlFormatOptions = [
  { value: 'direct_view', label: 'Direct View' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'download', label: 'Download' },
  { value: 'embed_view', label: 'Embed View' },
];

export default function EditUploadSettingPage() {
  const params = useParams();
  const { push } = usePortalRouter();
  const id = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [setting, setSetting] = useState<UploadSetting | null>(null);

  const [formData, setFormData] = useState({
    url_format: '',
    thumbnail_size: '',
    is_active: true,
  });

  useEffect(() => {
    fetchSetting();
  }, [id]);

  const fetchSetting = async () => {
    setLoading(true);
    try {
      const data = await uploadSettingsService.getById(id);
      setSetting(data);
      setFormData({
        url_format: data.url_format,
        thumbnail_size: data.thumbnail_size?.toString() || '',
        is_active: data.is_active,
      });
    } catch (error) {
      toast.error('Failed to load upload setting');
      push('upload-settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await uploadSettingsService.update(id, {
        url_format: formData.url_format,
        thumbnail_size: formData.thumbnail_size ? parseInt(formData.thumbnail_size) : null,
        is_active: formData.is_active,
      });

      toast.success('Upload setting updated successfully');
      push('upload-settings');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update upload setting');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!setting) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <PortalLink href="upload-settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </PortalLink>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Edit Upload Setting</h1>
            <p className="text-neutral-600 mt-0.5 capitalize">
              {setting.category} category
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
      >
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input
                value={setting.category}
                disabled
                className="capitalize bg-neutral-50"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Category cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="url_format">
                URL Format <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.url_format}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, url_format: value }))
                }
              >
                <SelectTrigger id="url_format">
                  <SelectValue placeholder="Select URL format" />
                </SelectTrigger>
                <SelectContent>
                  {urlFormatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500 mt-1">
                The URL format used for files in this category
              </p>
            </div>

            <div>
              <Label htmlFor="thumbnail_size">Thumbnail Size (px)</Label>
              <Input
                id="thumbnail_size"
                type="number"
                min="100"
                max="2000"
                placeholder="300"
                value={formData.thumbnail_size}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    thumbnail_size: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-neutral-500 mt-1">
                Optional. Thumbnail size in pixels (100-2000)
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-xs text-neutral-500">
                  Enable or disable this upload setting
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <PortalLink href="upload-settings">
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </PortalLink>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
