import { useState, useCallback } from 'react';
import {
  newsService,
  News,
  CreateNewsPayload,
  UpdateNewsPayload,
  FetchNewsParams,
} from '@/lib/api/services/news.service';

/**
 * news data hook
 * @generated
 */
interface UseNewsResult {
  items: News[];
  loading: boolean;
  error: Error | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchNews: (params?: FetchNewsParams) => Promise<void>;
  createNews: (data: CreateNewsPayload) => Promise<News>;
  updateNews: (id: number, data: UpdateNewsPayload) => Promise<News>;
  deleteNews: (id: number) => Promise<void>;
}

export function useNews(): UseNewsResult {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchNews = useCallback(async (params?: FetchNewsParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.list(params);
      setItems(response.data);
      setPagination({
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat news'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createNews = useCallback(async (data: CreateNewsPayload) => {
    const created = await newsService.create(data);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateNews = useCallback(async (id: number, data: UpdateNewsPayload) => {
    const updated = await newsService.update(id, data);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteNews = useCallback(async (id: number) => {
    await newsService.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    items,
    loading,
    error,
    pagination,
    fetchNews,
    createNews,
    updateNews,
    deleteNews,
  };
}
