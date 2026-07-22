import { useState, useCallback } from 'react';
import { uploadSettingsService, UploadSetting, FetchParams } from '@/lib/api/services/upload-settings.service';
import { PaginatedResponse } from '@/lib/api/types';

interface UseUploadSettingsResult {
  uploadSettings: UploadSetting[];
  loading: boolean;
  error: Error | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchUploadSettings: (params?: FetchParams) => Promise<void>;
  createUploadSetting: (data: Partial<UploadSetting>) => Promise<UploadSetting>;
  updateUploadSetting: (id: number, data: Partial<UploadSetting>) => Promise<UploadSetting>;
  deleteUploadSetting: (id: number) => Promise<void>;
}

export function useUploadSettings(): UseUploadSettingsResult {
  const [uploadSettings, setUploadSettings] = useState<UploadSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchUploadSettings = useCallback(async (params?: FetchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<UploadSetting> = await uploadSettingsService.list(params);
      setUploadSettings(response.data);
      setPagination({
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.perPage,
        totalPages: response.meta.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch upload settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createUploadSetting = useCallback(async (data: Partial<UploadSetting>) => {
    setLoading(true);
    setError(null);
    try {
      const newSetting = await uploadSettingsService.create(data);
      setUploadSettings(prev => [...prev, newSetting]);
      return newSetting;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create upload setting');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUploadSetting = useCallback(async (id: number, data: Partial<UploadSetting>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSetting = await uploadSettingsService.update(id, data);
      setUploadSettings(prev =>
        prev.map(setting => (setting.id === id ? updatedSetting : setting))
      );
      return updatedSetting;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update upload setting');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUploadSetting = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await uploadSettingsService.delete(id);
      setUploadSettings(prev => prev.filter(setting => setting.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete upload setting');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadSettings,
    loading,
    error,
    pagination,
    fetchUploadSettings,
    createUploadSetting,
    updateUploadSetting,
    deleteUploadSetting,
  };
}
