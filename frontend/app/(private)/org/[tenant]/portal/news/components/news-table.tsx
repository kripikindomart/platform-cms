'use client';

import { useState } from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { PortalLink } from '@/components/ui/portal-link';
import { News } from '@/lib/api/services/news.service';
import { DeleteDialog } from './delete-dialog';
import { EditNewsModal } from './edit-news-modal';

interface NewsTableProps {
  items: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

/**
 * news Table
 * @generated
 */
export function NewsTable({
  items,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onRefetch,
}: NewsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<News | null>(null);

  const handleDelete = (item: News) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    onRefetch();
  };

  const handleEdit = (item: News) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedItem(null);
    onRefetch();
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Content</TableHead>
              <TableHead className="font-semibold">Image</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={100} className="text-center py-12 text-neutral-500">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-neutral-50">
                  <TableCell>{String(item.title ?? '-')}</TableCell>
                  <TableCell>{String(item.content ?? '-')}</TableCell>
                  <TableCell>{String(item.image ?? '-')}</TableCell>
                  <TableCell>{String(item.date ?? '-')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="border-t border-neutral-100 px-6 py-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      </div>

      {selectedItem && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          item={selectedItem}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {selectedItem && (
        <EditNewsModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          item={selectedItem}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
