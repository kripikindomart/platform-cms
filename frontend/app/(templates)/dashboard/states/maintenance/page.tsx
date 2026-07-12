'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Construction, Clock } from 'lucide-react';

export default function MaintenancePage() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
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
            className="inline-flex w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-xl items-center justify-center mb-8 shadow-2xl"
          >
            <Construction className="w-16 h-16 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-3"
          >
            Under Maintenance
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 text-lg mb-8 max-w-md mx-auto"
          >
            We're currently performing scheduled maintenance to improve your experience.
            We'll be back shortly!
          </motion.p>

          {/* Countdown/Clock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-4 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-8"
          >
            <Clock className="w-6 h-6 text-white" />
            <div className="text-3xl font-mono font-bold text-white">
              {time.toLocaleTimeString()}
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-sm font-semibold">All systems operational</span>
            </div>
            <p className="text-white/70 text-sm">
              Expected completion: Within 2 hours
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-white/70 text-sm"
          >
            Follow us for updates:{' '}
            <a href="#" className="text-white hover:underline font-semibold">
              @yourcompany
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
