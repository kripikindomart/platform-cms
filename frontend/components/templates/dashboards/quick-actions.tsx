'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Plus, Upload, Download, Send, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Action {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

export interface QuickActionsProps {
  actions?: Action[];
  className?: string;
}

const defaultActions: Action[] = [
  {
    id: '1',
    label: 'Create',
    icon: Plus,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: '2',
    label: 'Upload',
    icon: Upload,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: '3',
    label: 'Export',
    icon: Download,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: '4',
    label: 'Send',
    icon: Send,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: '5',
    label: 'Report',
    icon: FileText,
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: '6',
    label: 'Team',
    icon: Users,
    color: 'from-purple-500 to-fuchsia-600',
  },
];

export function QuickActions({
  actions = defaultActions,
  className,
}: QuickActionsProps) {
  return (
    <div className={cn('p-6 bg-white rounded-2xl border border-neutral-200', className)}>
      {/* Header */}
      <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className="group relative p-4 rounded-xl bg-neutral-50 hover:bg-gradient-to-br hover:from-neutral-50 hover:to-neutral-100 border border-neutral-200 hover:border-neutral-300 transition-all duration-200"
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow',
                  action.color
                )}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Label */}
              <p className="text-sm font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                {action.label}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
