import { apiClient } from '../client';
import { PaginatedResponse } from '../types';

export interface UploadSetting {
  id: number;
  category: string;
  url_format: string;
  thumbnail_size: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
}

export interface FetchParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
}

class UploadSettingsService {
  private readonly basePath = '/upload-settings';

  async list(params?: FetchParams): Promise<PaginatedResponse<UploadSetting>> {
    return apiClient.get<PaginatedResponse<UploadSetting>>(this.basePath, { params });
  }

  async getById(id: number): Promise<UploadSetting> {
    return apiClient.get<UploadSetting>(`${this.basePath}/${id}`);
  }

  async getByCategory(category: string): Promise<UploadSetting> {
    return apiClient.get<UploadSetting>(`${this.basePath}/category/${category}`);
  }

  async create(data: Partial<UploadSetting>): Promise<UploadSetting> {
    return apiClient.post<UploadSetting>(this.basePath, data);
  }

  async update(id: number, data: Partial<UploadSetting>): Promise<UploadSetting> {
    return apiClient.patch<UploadSetting>(`${this.basePath}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  async seedDefaults(): Promise<{ message: string; count: number }> {
    return apiClient.post<{ message: string; count: number }>(`${this.basePath}/seed-defaults`, {});
  }

  async clearCache(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.basePath}/clear-cache`, {});
  }
}

export const uploadSettingsService = new UploadSettingsService();
