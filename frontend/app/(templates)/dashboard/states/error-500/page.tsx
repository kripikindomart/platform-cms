'use client';

import { motion } from 'framer-motion';
import { Server, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error500Page() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* 500 Number */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="mb-6"
          >
            <h1 className="text-9xl font-black bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent">
              500
            </h1>
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 items-center justify-center mb-6 shadow-xl shadow-red-500/30"
          >
            <Server className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-neutral-900 mb-3"
          >
            Internal Server Error
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-neutral-600 mb-8 max-w-md mx-auto"
          >
            Oops! Something went wrong on our end. Our team has been notified and we're
            working to fix the issue. Please try again later.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button className="h-12 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-sm text-neutral-500"
          >
            Error ID: ERR_500_{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
