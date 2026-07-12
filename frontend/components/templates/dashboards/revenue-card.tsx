'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RevenueCardProps {
  totalRevenue: string;
  change: number;
  periodLabel?: string;
  chartData?: number[];
  className?: string;
}

export function RevenueCard({
  totalRevenue,
  change,
  periodLabel = 'vs last month',
  chartData = [20, 35, 25, 45, 30, 50, 40, 60, 45, 70, 55, 80],
  className,
}: RevenueCardProps) {
  const isPositive = change >= 0;
  const max = Math.max(...chartData);
  const min = Math.min(...chartData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30 overflow-hidden relative',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold',
              isPositive
                ? 'bg-green-500/20 text-green-100'
                : 'bg-red-500/20 text-red-100'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(change)}%
          </div>
        </div>

        {/* Revenue */}
        <p className="text-white/80 text-sm mb-2">Total Revenue</p>
        <p className="text-4xl font-bold text-white mb-1">{totalRevenue}</p>
        <p className="text-white/60 text-xs mb-6">{periodLabel}</p>

        {/* Mini Chart */}
        <div className="flex items-end gap-1 h-16">
          {chartData.map((value, index) => {
            const height = ((value - min) / (max - min)) * 100;
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex-1 bg-white/30 rounded-t-sm hover:bg-white/50 transition-colors cursor-pointer"
              />
            );
          })}
        </div>

        {/* Action Button */}
        <button className="mt-6 w-full h-10 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-white text-sm font-semibold transition-all">
          View Details
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
