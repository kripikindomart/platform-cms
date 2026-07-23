'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UploadSetting, uploadSettingsService } from '@/lib/api/services/upload-settings.service';
import { toast } from 'sonner';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: UploadSetting;
  onSuccess: () => void;
}

export function DeleteDialog({ open, onOpenChange, setting, onSuccess }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await uploadSettingsService.delete(setting.id);
      toast.success('Upload setting deleted successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete upload setting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Upload Setting</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete the upload setting for <strong className="capitalize">{setting.category}</strong> category?
            This action cannot be undone and will affect all future file uploads in this category.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
