'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, Key, Shield, Clock, Smartphone } from 'lucide-react';

export default function AuthTemplatesPage() {
  const templates = [
    {
      id: 'login',
      title: 'Login',
      description: 'Split-screen login with social authentication',
      icon: Lock,
      href: '/dashboard/auth/login',
      color: 'from-indigo-500 to-purple-600',
      features: ['Social Login', 'Password Toggle', 'Remember Me'],
    },
    {
      id: 'register',
      title: 'Register',
      description: 'Registration with password strength indicator',
      icon: Mail,
      href: '/dashboard/auth/register',
      color: 'from-cyan-500 to-blue-600',
      features: ['Strength Meter', 'Requirements', 'Social Signup'],
    },
    {
      id: 'forgot-password',
      title: 'Forgot Password',
      description: 'Email verification for password reset',
      icon: Key,
      href: '/dashboard/auth/forgot-password',
      color: 'from-green-500 to-emerald-600',
      features: ['Email Verify', 'Success State', 'Resend'],
    },
    {
      id: 'reset-password',
      title: 'Reset Password',
      description: 'Create new password with validation',
      icon: Shield,
      href: '/dashboard/auth/reset-password',
      color: 'from-amber-500 to-orange-600',
      features: ['Token Validation', 'Strength Check', 'Match Check'],
    },
    {
      id: 'verify-email',
      title: 'Verify Email',
      description: 'Email verification with multiple states',
      icon: Mail,
      href: '/dashboard/auth/verify-email',
      color: 'from-rose-500 to-pink-600',
      features: ['4 States', 'Countdown Timer', 'Animations'],
    },
    {
      id: 'otp',
      title: 'OTP Verification',
      description: '6-digit OTP input with auto-submit',
      icon: Smartphone,
      href: '/dashboard/auth/otp',
      color: 'from-purple-500 to-fuchsia-600',
      features: ['Auto Focus', 'Paste Support', 'Countdown'],
    },
    {
      id: 'lock-screen',
      title: 'Lock Screen',
      description: 'Session lock with live clock',
      icon: Clock,
      href: '/dashboard/auth/lock-screen',
      color: 'from-blue-500 to-indigo-600',
      features: ['Live Clock', 'Glassmorphism', 'Dark Theme'],
    },
    {
      id: 'session-expired',
      title: 'Session Expired',
      description: 'Auto-redirect session timeout',
      icon: Clock,
      href: '/dashboard/auth/session-expired',
      color: 'from-violet-500 to-purple-600',
      features: ['Auto Redirect', 'Countdown', 'Security Info'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="w-px h-6 bg-neutral-200" />
            <h1 className="text-lg font-bold text-neutral-900">Authentication Templates</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-4">
            <Lock className="w-4 h-4" />
            8 Premium Templates
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Authentication Templates
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Production-ready authentication pages with premium design, smooth animations,
            and all the features you need for user authentication flows.
          </p>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={template.href}>
                  <div className="group h-full p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl transition-all duration-300">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-lg"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
