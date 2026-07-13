'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Paperclip, GripVertical } from 'lucide-react';

/**
 * KanbanCard - Draggable card for kanban board
 */

export interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  commentsCount?: number;
  attachmentsCount?: number;
  onClick?: () => void;
}

const priorityColors = {
  low: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

export function KanbanCard({
  id,
  title,
  description,
  priority,
  tags,
  assignee,
  dueDate,
  commentsCount,
  attachmentsCount,
  onClick,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-4 bg-white rounded-xl border border-neutral-200 
        hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer
        ${isDragging ? 'opacity-50 shadow-2xl' : ''}
      `}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-neutral-400" />
      </div>

      {/* Priority Badge */}
      {priority && (
        <div className="mb-3">
          <span
            className={`
              inline-block px-2.5 py-1 rounded-lg text-xs font-bold border
              ${priorityColors[priority]}
            `}
          >
            {priority.toUpperCase()}
          </span>
        </div>
      )}

      {/* Title & Description */}
      <h4 className="text-sm font-bold text-neutral-900 mb-1 line-clamp-2">{title}</h4>
      {description && (
        <p className="text-xs text-neutral-600 mb-3 line-clamp-2">{description}</p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-3">
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dueDate}</span>
            </div>
          )}
          {commentsCount !== undefined && commentsCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentsCount}</span>
            </div>
          )}
          {attachmentsCount !== undefined && attachmentsCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{attachmentsCount}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {assignee && (
          <div className="flex items-center gap-1.5">
            {assignee.avatar ? (
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {assignee.name.charAt(0)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
