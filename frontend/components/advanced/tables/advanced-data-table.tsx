'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Row,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Settings2,
} from 'lucide-react';

/**
 * AdvancedDataTable - Powerful data table using TanStack Table
 * Features: sorting, filtering, pagination, row selection, column visibility
 */

interface AdvancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  pageSize?: number;
  onRowClick?: (row: Row<TData>) => void;
  onExport?: (data: TData[]) => void;
}

export function AdvancedDataTable<TData>({
  data,
  columns,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnVisibility = false,
  enableExport = false,
  pageSize = 10,
  onRowClick,
  onExport,
}: AdvancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleExport = () => {
    if (onExport) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onExport(selectedRows.length > 0 ? selectedRows : data);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      {(enableFiltering || enableExport || enableColumnVisibility) && (
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {enableFiltering && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search all columns..."
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {enableExport && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 h-12 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}

            {enableColumnVisibility && (
              <button className="flex items-center gap-2 px-4 h-12 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-colors">
                <Settings2 className="w-4 h-4" />
                Columns
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-neutral-200 bg-neutral-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-bold text-neutral-900"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'flex items-center gap-2 cursor-pointer select-none hover:text-indigo-600 transition-colors'
                              : 'flex items-center gap-2'
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-neutral-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronsUpDown className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      border-b border-neutral-100 
                      ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/50' : ''}
                      ${row.getIsSelected() ? 'bg-indigo-50' : 'hover:bg-neutral-50'}
                      transition-colors
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-neutral-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-neutral-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-neutral-300" />
                      <p className="text-base font-medium">No results found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {enablePagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="font-medium">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>
              <span>of</span>
              <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>
              {enableRowSelection && table.getSelectedRowModel().rows.length > 0 && (
                <>
                  <span className="mx-1">•</span>
                  <span className="font-medium text-indigo-600">
                    {table.getSelectedRowModel().rows.length} selected
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-5 h-5 text-neutral-700" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-700" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-neutral-700">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-neutral-700" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-5 h-5 text-neutral-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
