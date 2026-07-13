'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Layout,
  Lock,
  LayoutDashboard,
  Table,
  FileText,
  Settings,
  Palette,
  Component,
  ArrowRight,
  FileWarning,
} from 'lucide-react';

export default function TemplateGalleryPage() {
  const categories = [
    {
      id: 'design-system',
      title: 'Design System',
      description: 'Colors, Typography, Spacing, Shadows',
      icon: Palette,
      count: 8,
      color: 'from-violet-500 to-purple-600',
      href: '/dashboard/design-system',
    },
    {
      id: 'auth',
      title: 'Authentication',
      description: 'Login, Register, Reset Password, OTP, Lock Screen',
      icon: Lock,
      count: 8,
      color: 'from-indigo-500 to-blue-600',
      href: '/dashboard/auth',
    },
    {
      id: 'layouts',
      title: 'Layouts',
      description: 'Sidebar, Header, Navigation, Command Palette',
      icon: Layout,
      count: 10,
      color: 'from-cyan-500 to-teal-600',
      href: '/dashboard/layouts',
    },
    {
      id: 'dashboards',
      title: 'Dashboards',
      description: 'Analytics, Stats, Charts, Widgets',
      icon: LayoutDashboard,
      count: 5,
      color: 'from-emerald-500 to-green-600',
      href: '/dashboard/dashboards',
    },
    {
      id: 'forms',
      title: 'Forms',
      description: 'Contact, Profile, Checkout, Survey, Settings',
      icon: FileText,
      count: 6,
      color: 'from-amber-500 to-orange-600',
      href: '/dashboard/forms',
    },
    {
      id: 'tables',
      title: 'Tables',
      description: 'Data Grid, Sorting, Filtering, Pagination',
      icon: Table,
      count: 4,
      color: 'from-rose-500 to-pink-600',
      href: '/dashboard/tables',
    },
    {
      id: 'states',
      title: 'State Pages',
      description: 'Empty, Loading, 404, 500, Maintenance, Success',
      icon: FileWarning,
      count: 6,
      color: 'from-orange-500 to-red-600',
      href: '/dashboard/states',
    },
    {
      id: 'components',
      title: 'Components',
      description: 'Cards, Modals, Alerts, Tabs, Badges',
      icon: Component,
      count: 30,
      color: 'from-blue-500 to-indigo-600',
      href: '/dashboard/components',
    },
    {
      id: 'pages',
      title: 'Pages',
      description: 'Settings, Profile, Billing, 404, 500',
      icon: Settings,
      count: 15,
      color: 'from-purple-500 to-fuchsia-600',
      href: '/dashboard/pages',
    },
    {
      id: 'advanced',
      title: 'Advanced Components',
      description: 'Premium libraries: Alerts, Tables, Charts, Kanban, Calendar',
      icon: Sparkles,
      count: 15,
      color: 'from-violet-500 to-indigo-600',
      href: '/dashboard/advanced',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Template Gallery</h1>
              <p className="text-sm text-neutral-600">Premium SaaS Design System</p>
            </div>
          </div>

          <Link
            href="/portal"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
          >
            Back to App
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Premium Quality • Linear • Stripe • Vercel Inspired
          </div>
          <h1 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Complete Dashboard
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Template System
            </span>
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            70+ production-ready components and 51+ templates built with Next.js 15,
            React 19, TypeScript, and Tailwind CSS. Designed for modern SaaS applications.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <div className="group relative p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Gradient Background on Hover */}
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
                        category.color
                      )}
                    />

                    {/* Content */}
                    <div className="relative">
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300',
                          category.color
                        )}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Text */}
                      <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500">
                          {category.count} Templates
                        </span>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-4 gap-6"
        >
          {[
            { label: 'Components', value: '85+' },
            { label: 'Templates', value: '80+' },
            { label: 'Layouts', value: '10+' },
            { label: 'Libraries', value: '18' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl border border-neutral-200 text-center"
            >
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">What's Included</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              'Premium Design System',
              'Authentication Pages',
              'Dashboard Layouts',
              'Form Templates',
              'Data Tables',
              'Charts & Graphs',
              'Kanban Board',
              'Event Calendar',
              'Empty States',
              'Loading States',
              'Error Pages',
              'Success Pages',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
