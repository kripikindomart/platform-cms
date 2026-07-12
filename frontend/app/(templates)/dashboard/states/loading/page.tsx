'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingStatePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Spinner */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30"
        >
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </motion.div>

        {/* Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-neutral-900 mb-2"
        >
          Loading...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-600"
        >
          Please wait while we fetch your data
        </motion.p>

        {/* Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-indigo-600"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
