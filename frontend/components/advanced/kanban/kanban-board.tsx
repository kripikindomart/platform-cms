'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus, MoreVertical } from 'lucide-react';
import { KanbanColumn, KanbanColumnProps } from './kanban-column';
import { KanbanCard } from './kanban-card';

/**
 * KanbanBoard - Drag and drop kanban board using DnD Kit
 * Features: drag & drop cards, move between columns, reorder
 */

export interface KanbanTask {
  id: string;
  columnId: string;
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
}

export interface KanbanColumnData extends Omit<KanbanColumnProps, 'children'> {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

interface KanbanBoardProps {
  columns: KanbanColumnData[];
  onTaskMove?: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
  onTaskClick?: (task: KanbanTask) => void;
  onAddTask?: (columnId: string) => void;
  onAddColumn?: () => void;
}

export function KanbanBoard({
  columns: initialColumns,
  onTaskMove,
  onTaskClick,
  onAddTask,
  onAddColumn,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnData[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and target columns
    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    // Move task to new column
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const sourceColumnIndex = newColumns.findIndex((col) => col.id === activeColumn.id);
      const targetColumnIndex = newColumns.findIndex((col) => col.id === overColumn.id);

      const sourceColumn = newColumns[sourceColumnIndex];
      const targetColumn = newColumns[targetColumnIndex];

      const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === activeId);
      const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
      movedTask.columnId = targetColumn.id;

      const overTaskIndex = targetColumn.tasks.findIndex((task) => task.id === overId);
      if (overTaskIndex !== -1) {
        targetColumn.tasks.splice(overTaskIndex, 0, movedTask);
      } else {
        targetColumn.tasks.push(movedTask);
      }

      return newColumns;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Find final position
    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );

    if (activeColumn && onTaskMove) {
      const task = activeColumn.tasks.find((t) => t.id === activeId);
      if (task && task.columnId !== activeColumn.id) {
        onTaskMove(activeId, activeColumn.id, task.columnId);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <KanbanColumn
              title={column.title}
              count={column.tasks.length}
              color={column.color}
            >
              <SortableContext
                items={column.tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      description={task.description}
                      priority={task.priority}
                      tags={task.tags}
                      assignee={task.assignee}
                      dueDate={task.dueDate}
                      commentsCount={task.commentsCount}
                      attachmentsCount={task.attachmentsCount}
                      onClick={() => onTaskClick?.(task)}
                    />
                  ))}
                </div>
              </SortableContext>

              {onAddTask && (
                <button
                  onClick={() => onAddTask(column.id)}
                  className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-neutral-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-neutral-500 hover:text-indigo-600 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              )}
            </KanbanColumn>
          </div>
        ))}

        {onAddColumn && (
          <button
            onClick={onAddColumn}
            className="flex-shrink-0 w-80 h-fit p-6 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-neutral-500 hover:text-indigo-600 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Column
          </button>
        )}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-50 rotate-3">
            <KanbanCard {...activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
