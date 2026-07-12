'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface SessionExpiredTemplateProps {
  onRelogin?: () => void;
  autoRedirectSeconds?: number;
  sessionDuration?: string;
}

export function SessionExpiredTemplate({
  onRelogin,
  autoRedirectSeconds = 10,
  sessionDuration = '2 hours',
}: SessionExpiredTemplateProps) {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onRelogin?.();
    }
  }, [countdown, onRelogin]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Session expired</h2>
          <p className="text-neutral-600 mb-6">
            Your session has expired after {sessionDuration} of inactivity. Please sign in again to continue.
          </p>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-xl mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Security tip:</span> We automatically log you out after a period of inactivity to protect your account.
            </p>
          </div>

          {/* Auto Redirect Notice */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-neutral-700">
                Redirecting in {countdown}s...
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onRelogin}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Sign in again</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>

            <Link
              href="/dashboard/auth/login"
              className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Go to login page
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-700 transition-colors">
              Need help?
            </a>
            <span>·</span>
            <a href="#" className="hover:text-neutral-700 transition-colors">
              Security
            </a>
            <span>·</span>
            <a href="#" className="hover:text-neutral-700 transition-colors">
              Support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
