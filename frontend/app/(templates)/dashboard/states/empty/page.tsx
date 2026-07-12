'use client';

import { motion } from 'framer-motion';
import { Inbox, Plus, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyStatePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex w-32 h-32 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 items-center justify-center mb-8"
          >
            <Inbox className="w-16 h-16 text-neutral-400" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-neutral-900 mb-3"
          >
            No Items Yet
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-neutral-600 mb-8 max-w-md mx-auto"
          >
            Get started by creating your first item. You can add as many items as you need
            and organize them however you like.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Create New Item
            </Button>
            <Button className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all">
              <Upload className="w-4 h-4 mr-2" />
              Import Items
            </Button>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-neutral-500"
          >
            Need help getting started?{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              View documentation
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
