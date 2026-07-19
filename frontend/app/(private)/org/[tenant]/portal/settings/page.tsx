'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Palette, Globe, Database } from 'lucide-react';

export default function SettingsPage() {
  const settingsCategories = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Password and authentication settings',
      color: 'from-red-500 to-pink-600',
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize theme and layout',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: Globe,
      title: 'Localization',
      description: 'Language and region settings',
      color: 'from-green-500 to-teal-600',
    },
    {
      icon: Database,
      title: 'Data & Storage',
      description: 'Manage data retention and backups',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-0.5">Manage your organization settings</p>
        </div>
      </motion.div>

      {/* Settings Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {settingsCategories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 hover:shadow-lg hover:border-neutral-200 transition-all cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <category.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              {category.title}
            </h3>
            <p className="text-sm text-neutral-600">{category.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center"
      >
        <p className="text-blue-800 font-medium">
          Settings configuration coming soon
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Full settings management will be available in the next release
        </p>
      </motion.div>
    </div>
  );
}
