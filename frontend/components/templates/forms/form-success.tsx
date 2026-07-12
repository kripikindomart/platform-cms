'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FormSuccessProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function FormSuccess({
  title = 'Success!',
  message = 'Your form has been submitted successfully.',
  actionLabel = 'Continue',
  onAction,
  secondaryLabel,
  onSecondary,
}: FormSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 items-center justify-center mb-6 shadow-2xl shadow-green-500/30"
      >
        <CheckCircle2 className="w-12 h-12 text-white" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-neutral-900 mb-3"
      >
        {title}
      </motion.h2>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-neutral-600 mb-8 max-w-md mx-auto"
      >
        {message}
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-3"
      >
        {secondaryLabel && onSecondary && (
          <Button
            onClick={onSecondary}
            className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
          >
            {secondaryLabel}
          </Button>
        )}
        {onAction && (
          <Button
            onClick={onAction}
            className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
