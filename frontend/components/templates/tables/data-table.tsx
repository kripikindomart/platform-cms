'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filterable?: boolean;
  onFilter?: () => void;
  exportable?: boolean;
  onExport?: () => void;
  selectable?: boolean;
  onSelect?: (selected: T[]) => void;
  actions?: (row: T) => React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  filterable,
  onFilter,
  exportable,
  onExport,
  selectable,
  onSelect,
  actions,
  pagination,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    
    if (onSelect) {
      const selectedData = Array.from(newSelected).map((i) => data[i]);
      onSelect(selectedData);
    }
  };

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {(searchable || filterable || exportable) && (
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-12 rounded-xl border-neutral-200 bg-white pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {filterable && (
              <Button
                onClick={onFilter}
                className="h-10 rounded-lg border-2 border-neutral-200 px-4 text-sm font-semibold hover:bg-neutral-50 transition-all"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            )}
            {exportable && (
              <Button
                onClick={onExport}
                className="h-10 rounded-lg border-2 border-neutral-200 px-4 text-sm font-semibold hover:bg-neutral-50 transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {selectable && (
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-neutral-100',
                      column.width
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={cn(
                              'w-3 h-3 -mb-1',
                              sortConfig?.key === column.key &&
                                sortConfig.direction === 'asc'
                                ? 'text-indigo-600'
                                : 'text-neutral-400'
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'w-3 h-3',
                              sortConfig?.key === column.key &&
                                sortConfig.direction === 'desc'
                                ? 'text-indigo-600'
                                : 'text-neutral-400'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="w-20 px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="text-neutral-500">{emptyMessage}</div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.02 }}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowIndex)}
                          onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 text-sm text-neutral-900"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-sm">
                        {actions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
