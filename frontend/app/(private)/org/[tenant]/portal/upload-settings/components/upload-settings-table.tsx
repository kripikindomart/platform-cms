'use client';

import React, { useState } from 'react';
import { Edit, Trash2, MoreVertical, Image, FileText, Video, Music, File } from 'lucide-react';
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
import { UploadSetting } from '@/lib/api/services/upload-settings.service';
import { DeleteDialog } from './delete-dialog';

interface UploadSettingsTableProps {
  settings: UploadSetting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefetch: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  image: Image,
  document: FileText,
  video: Video,
  audio: Music,
  other: File,
};

const urlFormatLabels: Record<string, string> = {
  direct_view: 'Direct View',
  thumbnail: 'Thumbnail',
  download: 'Download',
  embed_view: 'Embed View',
};

export function UploadSettingsTable({
  settings,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  onRefetch,
}: UploadSettingsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<UploadSetting | null>(null);

  const handleDelete = (setting: UploadSetting) => {
    setSelectedSetting(setting);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedSetting(null);
    onRefetch();
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">URL Format</TableHead>
              <TableHead className="font-semibold">Thumbnail Size</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-neutral-500">
                  No upload settings found
                </TableCell>
              </TableRow>
            ) : (
              settings.map((setting) => {
                const Icon = categoryIcons[setting.category] || File;
                return (
                  <TableRow key={setting.id} className="hover:bg-neutral-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium capitalize">{setting.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {urlFormatLabels[setting.url_format] || setting.url_format}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {setting.thumbnail_size ? (
                        <span className="text-sm text-neutral-600">{setting.thumbnail_size}px</span>
                      ) : (
                        <span className="text-sm text-neutral-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                        {setting.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PortalLink href={`upload-settings/${setting.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </PortalLink>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(setting)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="border-t border-neutral-100 px-6 py-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={onPageChange}
            onItemsPerPageChange={onLimitChange}
          />
        </div>
      </div>

      {selectedSetting && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          setting={selectedSetting}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
