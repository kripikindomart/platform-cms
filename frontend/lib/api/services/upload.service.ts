/**
 * Upload API Service
 */

import { apiClient } from '../client';
import { useAuthStore } from '@/lib/stores/auth.store';

export interface UploadResponse {
  url: string;
  fileId: string;
  filename: string;
  size: number;
  mimetype: string;
  provider: string;
  metadata?: {
    webViewLink?: string;
    webContentLink?: string;
    originalName?: string;
  };
}

export const uploadService = {
  /**
   * Upload file to Google Drive
   */
  async uploadFile(file: File, folderId?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    // Don't send folder parameter for now - will use default folder from backend
    // if (folderId) {
    //   formData.append('folder', folderId);
    // }

    // Get token from auth store
    const token = useAuthStore.getState().token;

    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Get tenant slug from URL or use default
    let tenantSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || '';
    if (typeof window !== 'undefined') {
      const pathMatch = window.location.pathname.match(/\/org\/([^\/]+)/);
      if (pathMatch) {
        tenantSlug = pathMatch[1];
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Slug': tenantSlug,
        // Don't set Content-Type - let browser handle it with boundary
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Upload failed',
      }));
      throw new Error(error.message || 'Upload failed');
    }

    const result = await response.json();
    // Backend returns { success, message, data }
    return result.data;
  },

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[], folderId?: string): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folderId) {
      formData.append('folderId', folderId);
    }

    return await apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get file info
   */
  async getFileInfo(fileId: string): Promise<UploadResponse> {
    return await apiClient.get(`/upload/${fileId}`);
  },

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`/upload/${fileId}`);
  },

  /**
   * Get file public URL
   */
  getPublicUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  },

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(fileId: string, size: number = 200): string {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  },
};
