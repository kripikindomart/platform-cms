import { apiClient } from '../client';

/**
 * news API Service
 * @generated
 */
export interface News {
  id: number;
  uuid: string | null;
  title: string | null;
  content: string | null;
  image: string | null;
  date: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface NewsListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsListResponse {
  data: News[];
  meta: NewsListMeta;
}

export interface FetchNewsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export type CreateNewsPayload = Omit<News, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdateNewsPayload = Partial<CreateNewsPayload>;

class NewsService {
  private readonly basePath = '/news';

  async list(params?: FetchNewsParams): Promise<NewsListResponse> {
    return apiClient.get<NewsListResponse>(this.basePath, { params });
  }

  async getById(id: number): Promise<News> {
    return apiClient.get<News>(`${this.basePath}/${id}`);
  }

  async create(data: CreateNewsPayload): Promise<News> {
    return apiClient.post<News>(this.basePath, data);
  }

  async update(id: number, data: UpdateNewsPayload): Promise<News> {
    return apiClient.patch<News>(`${this.basePath}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const newsService = new NewsService();
