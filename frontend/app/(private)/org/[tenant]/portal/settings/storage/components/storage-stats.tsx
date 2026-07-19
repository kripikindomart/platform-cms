'use client';

import { motion } from 'framer-motion';
import { HardDrive, Image, FileText, TrendingUp } from 'lucide-react';

interface StorageStatsProps {
  settings: any;
}

export function StorageStats({ settings }: StorageStatsProps) {
  const stats = [
    {
      title: 'Storage Used',
      value: '2.4 GB',
      subtitle: 'of 400 GB',
      icon: HardDrive,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Images',
      value: '1,234',
      subtitle: 'files',
      icon: Image,
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Documents',
      value: '567',
      subtitle: 'files',
      icon: FileText,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Growth',
      value: '+12%',
      subtitle: 'this month',
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            
            <h3 className="text-xs font-medium text-neutral-600 mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-neutral-900">
              {stat.value}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {stat.subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
