'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { KanbanBoard, KanbanColumnData } from '@/components/advanced';
import toast from 'react-hot-toast';

/**
 * Kanban Board Demo
 * Showcasing DnD Kit drag and drop functionality
 */

export default function KanbanDemoPage() {
  const [columns, setColumns] = useState<KanbanColumnData[]>([
    {
      id: 'todo',
      title: 'To Do',
      color: 'indigo',
      tasks: [
        {
          id: '1',
          columnId: 'todo',
          title: 'Design new landing page',
          description: 'Create mockups for the new marketing landing page',
          priority: 'high',
          tags: ['design', 'marketing'],
          assignee: { name: 'John Doe' },
          dueDate: 'Jan 25',
          commentsCount: 3,
          attachmentsCount: 2,
        },
        {
          id: '2',
          columnId: 'todo',
          title: 'Update API documentation',
          description: 'Add new endpoints to the API docs',
          priority: 'medium',
          tags: ['documentation'],
          assignee: { name: 'Jane Smith' },
          dueDate: 'Jan 28',
          commentsCount: 1,
        },
        {
          id: '3',
          columnId: 'todo',
          title: 'Fix mobile navigation',
          description: 'Navigation menu not working properly on mobile devices',
          priority: 'urgent',
          tags: ['bug', 'mobile'],
          assignee: { name: 'Bob Johnson' },
          dueDate: 'Jan 20',
          commentsCount: 5,
          attachmentsCount: 1,
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'blue',
      tasks: [
        {
          id: '4',
          columnId: 'in-progress',
          title: 'Implement user authentication',
          description: 'Add JWT-based auth with refresh tokens',
          priority: 'high',
          tags: ['backend', 'security'],
          assignee: { name: 'Alice Williams' },
          dueDate: 'Jan 22',
          commentsCount: 8,
          attachmentsCount: 3,
        },
        {
          id: '5',
          columnId: 'in-progress',
          title: 'Create dashboard widgets',
          description: 'Build reusable widget components for the dashboard',
          priority: 'medium',
          tags: ['frontend', 'components'],
          assignee: { name: 'Charlie Brown' },
          dueDate: 'Jan 30',
          commentsCount: 2,
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: 'purple',
      tasks: [
        {
          id: '6',
          columnId: 'review',
          title: 'Payment gateway integration',
          description: 'Integrate Stripe payment processing',
          priority: 'high',
          tags: ['backend', 'payment'],
          assignee: { name: 'Diana Prince' },
          dueDate: 'Jan 24',
          commentsCount: 4,
          attachmentsCount: 1,
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'green',
      tasks: [
        {
          id: '7',
          columnId: 'done',
          title: 'Setup CI/CD pipeline',
          description: 'Configure GitHub Actions for automated deployments',
          priority: 'medium',
          tags: ['devops'],
          assignee: { name: 'Ethan Hunt' },
          dueDate: 'Jan 15',
          commentsCount: 6,
        },
        {
          id: '8',
          columnId: 'done',
          title: 'Database schema design',
          description: 'Design and implement the database schema',
          priority: 'high',
          tags: ['database'],
          assignee: { name: 'Fiona Gallagher' },
          dueDate: 'Jan 18',
          commentsCount: 3,
          attachmentsCount: 2,
        },
      ],
    },
  ]);

  const handleTaskMove = (taskId: string, sourceColumnId: string, targetColumnId: string) => {
    console.log(`Task ${taskId} moved from ${sourceColumnId} to ${targetColumnId}`);
    toast.success('Task moved successfully!');
  };

  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task);
    toast(`Viewing: ${task.title}`, { icon: '👀' });
  };

  const handleAddTask = (columnId: string) => {
    console.log('Add task to column:', columnId);
    toast('Add task feature coming soon!', { icon: '✨' });
  };

  const handleAddColumn = () => {
    console.log('Add new column');
    toast('Add column feature coming soon!', { icon: '➕' });
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/advanced"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Advanced
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-3">
              Kanban Board
            </h1>
            <p className="text-lg text-neutral-600">
              Drag and drop task management powered by DnD Kit
            </p>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">💡</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-900 mb-1">How to use:</h3>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Drag cards between columns to change status</li>
                <li>• Click on a card to view details</li>
                <li>• Use "Add Task" button to create new tasks</li>
                <li>• Priority badges: 🔴 Urgent, 🟠 High, 🔵 Medium, ⚪ Low</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 grid grid-cols-4 gap-4"
        >
          {columns.map((column) => (
            <div
              key={column.id}
              className="p-4 bg-white rounded-xl border border-neutral-200"
            >
              <div className="text-sm text-neutral-600 mb-1">{column.title}</div>
              <div className="text-2xl font-bold text-neutral-900">
                {column.tasks.length}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Kanban Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm"
        >
          <KanbanBoard
            columns={columns}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            onAddColumn={handleAddColumn}
          />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl border border-neutral-200"
        >
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Kanban Features</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              'Drag and drop cards',
              'Move between columns',
              'Task priorities',
              'Tags and labels',
              'Assignee avatars',
              'Due dates',
              'Comments count',
              'Attachments count',
              'Touch device support',
              'Smooth animations',
              'Real-time updates',
              'Customizable columns',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                <span className="text-sm text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-neutral-300 overflow-x-auto">
            <code>{`import { KanbanBoard } from '@/components/advanced';

const columns = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'indigo',
    tasks: [
      {
        id: '1',
        columnId: 'todo',
        title: 'Design new feature',
        description: 'Create mockups',
        priority: 'high',
        tags: ['design'],
        assignee: { name: 'John Doe' },
        dueDate: 'Jan 25',
      },
    ],
  },
];

<KanbanBoard
  columns={columns}
  onTaskMove={(taskId, from, to) => console.log('Moved')}
  onTaskClick={(task) => console.log('Clicked', task)}
  onAddTask={(columnId) => console.log('Add to', columnId)}
/>`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
