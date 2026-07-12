'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface VerifyEmailTemplateProps {
  status?: 'verifying' | 'success' | 'error' | 'expired';
  onResend?: () => void;
  email?: string;
}

export function VerifyEmailTemplate({ status = 'verifying', onResend, email = 'user@example.com' }: VerifyEmailTemplateProps) {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    onResend?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verifying your email...</h2>
              <p className="text-neutral-600 mb-6">Please wait while we verify your email address.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>This may take a few seconds</span>
              </div>
            </>
          )}

          {status === 'success' && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Email verified!</h2>
              <p className="text-neutral-600 mb-6">Your email <span className="font-semibold text-neutral-900">{email}</span> has been successfully verified.</p>
              <Link href="/dashboard/auth/login" className="inline-block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all">
                Continue to login
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verification failed</h2>
              <p className="text-neutral-600 mb-6">We couldn't verify your email. The link may be invalid or expired.</p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleResend} disabled={!canResend} className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
                  {canResend ? 'Resend verification email' : `Resend in ${countdown}s`}
                </Button>
                <Link href="/dashboard/auth/login" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Back to login
                </Link>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Link expired</h2>
              <p className="text-neutral-600 mb-6">This verification link has expired. Please request a new one.</p>
              <Button onClick={handleResend} disabled={!canResend} className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
                {canResend ? 'Send new verification link' : `Wait ${countdown}s`}
              </Button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Need help? <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold">Contact support</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
