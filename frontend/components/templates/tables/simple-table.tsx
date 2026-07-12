'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SimpleColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface SimpleTableProps {
  columns: SimpleColumn[];
  data: any[];
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function SimpleTable({
  columns,
  data,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  emptyMessage = 'No data available',
  className,
}: SimpleTableProps) {
  return (
    <div className={cn('bg-white rounded-2xl overflow-hidden', bordered && 'border border-neutral-200', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-xs font-bold text-neutral-700 uppercase tracking-wider',
                    compact ? 'px-4 py-3' : 'px-6 py-4',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    !column.align && 'text-left',
                    column.width
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(!striped && 'divide-y divide-neutral-200')}>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn('text-center text-neutral-500', compact ? 'px-4 py-8' : 'px-6 py-12')}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  className={cn(
                    hoverable && 'hover:bg-neutral-50 transition-colors',
                    striped && rowIndex % 2 === 1 && 'bg-neutral-50/50'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'text-sm text-neutral-900',
                        compact ? 'px-4 py-3' : 'px-6 py-4',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
