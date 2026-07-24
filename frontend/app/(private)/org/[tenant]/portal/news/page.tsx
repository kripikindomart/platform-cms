'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PortalLink } from '@/components/ui/portal-link';
import { useNews } from '@/hooks/use-news';
import { NewsTable } from './components/news-table';

/**
 * news List Page
 * @generated
 */
export default function NewsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { items, loading, error, pagination, fetchNews } = useNews();

  useEffect(() => {
    fetchNews({ page, limit, search: searchQuery || undefined });
  }, [page, limit, searchQuery]);

  const handleRefetch = () => fetchNews({ page, limit, search: searchQuery || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">news</h1>
            <p className="text-neutral-600 mt-0.5">
              {loading ? 'Memuat...' : `${pagination.total} data ditemukan`}
            </p>
          </div>
        </div>

        <PortalLink href="news/create">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
        </PortalLink>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Cari news..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        {loading && items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
            <div className="text-red-600 font-semibold mb-2">Gagal memuat data</div>
            <p className="text-sm text-neutral-600 mb-4">{error.message}</p>
            <Button onClick={handleRefetch} variant="outline">
              Coba Lagi
            </Button>
          </div>
        ) : (
          <NewsTable
            items={items}
            total={pagination.total}
            page={page}
            limit={limit}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onRefetch={handleRefetch}
          />
        )}
      </div>

    </div>
  );
}
