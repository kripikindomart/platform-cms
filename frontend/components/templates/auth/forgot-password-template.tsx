'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export interface ForgotPasswordTemplateProps {
  onSubmit?: (email: string) => void;
  isLoading?: boolean;
  success?: boolean;
}

export function ForgotPasswordTemplate({ onSubmit, isLoading = false, success = false }: ForgotPasswordTemplateProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl">
          {!success ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Forgot password?</h2>
              <p className="text-neutral-600 mb-6">No worries, we'll send you reset instructions.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">Email address</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required className="h-12 rounded-xl border-neutral-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Send reset link</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>

              <Link href="/dashboard/auth/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </Link>
            </>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check your email</h2>
              <p className="text-neutral-600 mb-6">We've sent a password reset link to <span className="font-semibold text-neutral-900">{email}</span></p>

              <div className="p-4 bg-blue-50 rounded-xl mb-6">
                <p className="text-sm text-blue-800">Didn't receive the email? Check your spam folder or <button className="font-semibold underline">resend</button></p>
              </div>

              <Link href="/dashboard/auth/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                Back to login
              </Link>
            </motion.div>
          )}
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-700 transition-colors">Help Center</a>
            <span>·</span>
            <a href="#" className="hover:text-neutral-700 transition-colors">Contact Support</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
