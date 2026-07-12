'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down';
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  iconColor = 'from-indigo-500 to-purple-600',
  trend,
  loading = false,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const trendDirection = trend || (isPositive ? 'up' : 'down');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      {loading ? (
        // Skeleton Loading
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-200" />
          </div>
          <div className="h-4 bg-neutral-200 rounded w-24 mb-3" />
          <div className="h-8 bg-neutral-200 rounded w-32 mb-3" />
          <div className="h-3 bg-neutral-200 rounded w-20" />
        </div>
      ) : (
        <>
          {/* Icon */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                iconColor
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            {change !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                  trendDirection === 'up'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                {trendDirection === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(change)}%
              </div>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mb-2">{value}</p>
          {change !== undefined && (
            <p className="text-xs text-neutral-500">{changeLabel}</p>
          )}
        </>
      )}
    </motion.div>
  );
}
