'use client';

import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

/**
 * KanbanColumn - Column container for kanban board
 */

export interface KanbanColumnProps {
  title: string;
  count?: number;
  color?: string;
  children: React.ReactNode;
}

export function KanbanColumn({ title, count, color = 'indigo', children }: KanbanColumnProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-neutral-900">{title}</h3>
          {count !== undefined && (
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo
              }`}
            >
              {count}
            </span>
          )}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Column Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-1">
        {children}
      </div>
    </div>
  );
}
