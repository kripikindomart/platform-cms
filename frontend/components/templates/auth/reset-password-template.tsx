'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export interface ResetPasswordTemplateProps {
  onSubmit?: (password: string) => void;
  isLoading?: boolean;
  success?: boolean;
  tokenValid?: boolean;
}

export function ResetPasswordTemplate({ onSubmit, isLoading = false, success = false, tokenValid = true }: ResetPasswordTemplateProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = password ? [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length : 0;
  const passwordMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMatch) onSubmit?.(password);
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-rose-50 via-red-50 to-orange-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Link expired</h2>
            <p className="text-neutral-600 mb-6">This password reset link has expired or is invalid.</p>
            <Link href="/dashboard/auth/forgot-password" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all">
              Request new link
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl">
          {!success ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Reset your password</h2>
              <p className="text-neutral-600 mb-6">Create a new strong password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-neutral-700">New password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required className="h-12 rounded-xl border-neutral-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-all pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5 text-neutral-400" /> : <Eye className="w-5 h-5 text-neutral-400" />}
                    </button>
                  </div>

                  {password && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${level <= passwordStrength ? passwordStrength <= 2 ? 'bg-red-500' : passwordStrength === 3 ? 'bg-yellow-500' : 'bg-green-500' : 'bg-neutral-200'}`} />
                        ))}
                      </div>
                      <div className="space-y-1 text-xs">
                        {[
                          { text: 'At least 8 characters', met: password.length >= 8 },
                          { text: 'Contains uppercase', met: /[A-Z]/.test(password) },
                          { text: 'Contains lowercase', met: /[a-z]/.test(password) },
                          { text: 'Contains number', met: /[0-9]/.test(password) },
                        ].map((req, i) => (
                          <div key={i} className="flex items-center gap-2 text-neutral-600">
                            {req.met ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-neutral-400" />}
                            <span className={req.met ? 'text-green-700 font-medium' : ''}>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-700">Confirm password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} required className="h-12 rounded-xl border-neutral-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                  {confirmPassword && !passwordMatch && <p className="text-sm text-red-600 font-medium">Passwords do not match</p>}
                </div>

                <Button type="submit" disabled={isLoading || !passwordMatch} className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Password reset!</h2>
              <p className="text-neutral-600 mb-6">Your password has been successfully reset.</p>
              <Link href="/dashboard/auth/login" className="inline-block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all">
                Sign in to your account
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
