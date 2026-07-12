'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface LockScreenTemplateProps {
  onUnlock?: (password: string) => void;
  isLoading?: boolean;
  error?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function LockScreenTemplate({
  onUnlock,
  isLoading = false,
  error,
  user = { name: 'Admin User', email: 'admin@company.com' },
}: LockScreenTemplateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock?.(password);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Time Display */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-7xl font-bold text-white mb-2">{formatTime(time)}</h1>
          <p className="text-xl text-white/60">{formatDate(time)}</p>
        </motion.div>

        {/* Lock Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="p-8 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 ring-4 ring-white/20">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  user.name.split(' ').map((n) => n[0]).join('')
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-sm text-white/60">{user.email}</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-sm font-medium text-red-200 text-center">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-14 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-white/60" /> : <Eye className="w-5 h-5 text-white/60" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Unlocking...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>Unlock</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Switch User */}
            <div className="mt-6 text-center">
              <a href="/dashboard/auth/login" className="text-sm text-white/60 hover:text-white transition-colors">
                Sign in as different user
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
