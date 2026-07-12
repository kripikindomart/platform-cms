'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  time: string;
  user?: string;
}

export interface ActivityTimelineProps {
  activities?: Activity[];
  maxItems?: number;
  className?: string;
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'success',
    title: 'Payment received',
    description: 'Invoice #1234 paid by John Doe',
    time: '2 minutes ago',
    user: 'JD',
  },
  {
    id: '2',
    type: 'info',
    title: 'New user registered',
    description: 'Jane Smith created an account',
    time: '1 hour ago',
    user: 'JS',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Server load high',
    description: 'CPU usage at 85%',
    time: '3 hours ago',
  },
  {
    id: '4',
    type: 'success',
    title: 'Deployment successful',
    description: 'Version 2.1.0 deployed to production',
    time: '5 hours ago',
  },
  {
    id: '5',
    type: 'error',
    title: 'API rate limit exceeded',
    description: 'Rate limit reached for endpoint /api/users',
    time: '1 day ago',
  },
];

const typeConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

export function ActivityTimeline({
  activities = defaultActivities,
  maxItems = 5,
  className,
}: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={cn('p-6 bg-white rounded-2xl border border-neutral-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-neutral-900">Recent Activity</h3>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          View All
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {displayedActivities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="relative flex gap-4"
            >
              {/* Timeline Line */}
              {index < displayedActivities.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-neutral-200" />
              )}

              {/* Icon */}
              <div className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg, config.border, 'border')}>
                <Icon className={cn('w-5 h-5', config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{activity.description}</p>
                {activity.user && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                      {activity.user}
                    </div>
                    <span className="text-xs text-neutral-500">User action</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayedActivities.length === 0 && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-900 mb-1">No activity yet</p>
          <p className="text-sm text-neutral-500">Activity will appear here</p>
        </div>
      )}
    </div>
  );
}
