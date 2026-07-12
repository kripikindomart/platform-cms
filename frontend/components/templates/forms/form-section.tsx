'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: FormSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm', className)}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-900 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-neutral-600">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}
