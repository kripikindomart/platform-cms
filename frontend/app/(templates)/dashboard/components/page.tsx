'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Component, ArrowRight } from 'lucide-react';

export default function ComponentsIndexPage() {
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
            <h1 className="text-lg font-bold text-neutral-900">UI Components</h1>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <Component className="w-4 h-4" />
            17+ Components
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            UI Component Library
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mb-8">
            Premium components built with React, TypeScript, and Tailwind CSS.
            All components follow our strict design system for consistency.
          </p>

          {/* CTA */}
          <Link
            href="/portal/components"
            className="inline-flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
          >
            View Interactive Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Component Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              category: 'Form Components',
              components: [
                'Input',
                'Textarea',
                'Select',
                'CustomSelect',
                'Switch',
                'RadioGroup',
                'Checkbox',
                'Label',
              ],
              color: 'from-indigo-500 to-purple-600',
            },
            {
              category: 'Feedback',
              components: [
                'Alert (4 variants)',
                'Modal',
                'Toast',
                'Badge',
                'Progress',
                'Skeleton',
              ],
              color: 'from-cyan-500 to-blue-600',
            },
            {
              category: 'Navigation',
              components: ['Tabs', 'Pagination', 'Breadcrumb', 'Menu', 'Dropdown'],
              color: 'from-green-500 to-emerald-600',
            },
            {
              category: 'Data Display',
              components: [
                'Table',
                'Card',
                'List',
                'Avatar',
                'Badge',
                'Tooltip',
              ],
              color: 'from-amber-500 to-orange-600',
            },
            {
              category: 'Layout',
              components: [
                'Container',
                'Grid',
                'Stack',
                'Divider',
                'Spacer',
              ],
              color: 'from-rose-500 to-pink-600',
            },
            {
              category: 'Actions',
              components: [
                'Button (9 variants)',
                'IconButton',
                'ButtonGroup',
                'ToggleButton',
              ],
              color: 'from-purple-500 to-fuchsia-600',
            },
          ].map((group, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Component className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">
                {group.category}
              </h3>
              <ul className="space-y-2">
                {group.components.map((comp, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    {comp}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Component Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'TypeScript Support',
              'Fully Accessible (WCAG AA)',
              'Dark Mode Ready',
              'Responsive Design',
              'Framer Motion Animations',
              'Customizable Variants',
              'Form Validation',
              'Loading States',
              'Error States',
              'Icon Support',
              'Keyboard Navigation',
              'Focus Management',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
