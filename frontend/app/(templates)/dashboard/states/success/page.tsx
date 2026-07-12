'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessStatePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex w-32 h-32 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 items-center justify-center mb-8 shadow-2xl shadow-green-500/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-neutral-900 mb-3"
          >
            Success!
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-neutral-600 mb-8 max-w-md mx-auto"
          >
            Your operation has been completed successfully. All changes have been saved
            and you're good to go!
          </motion.p>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-md mx-auto mb-8 p-6 bg-white rounded-2xl border border-neutral-200 text-left"
          >
            <h3 className="text-sm font-bold text-neutral-900 mb-4">Operation Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Status:</span>
                <span className="font-semibold text-green-600">Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Transaction ID:</span>
                <span className="font-mono text-neutral-900">TXN-{Date.now()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Timestamp:</span>
                <span className="text-neutral-900">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button className="h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
