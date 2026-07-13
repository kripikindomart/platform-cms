'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  BarChart3,
  Table as TableIcon,
  Columns3,
  Calendar as CalendarIcon,
  Search,
} from 'lucide-react';

/**
 * Advanced Components Index Page
 * Overview of all advanced components with links to demos
 */

export default function AdvancedComponentsPage() {
  const components = [
    {
      id: 'alerts',
      title: 'Alerts & Notifications',
      description: 'SweetAlert2 modals and React Hot Toast notifications',
      icon: Bell,
      color: 'from-indigo-500 to-blue-600',
      href: '/dashboard/advanced/alerts',
      features: ['Success/Error/Warning alerts', 'Toast notifications', 'Confirmation dialogs', 'Loading states'],
    },
    {
      id: 'search-select',
      title: 'Search Select',
      description: 'Advanced searchable dropdown with React Select',
      icon: Search,
      color: 'from-purple-500 to-pink-600',
      href: '/dashboard/advanced/search-select',
      features: ['Searchable options', 'Multi-select', 'Async loading', 'Custom styling'],
    },
    {
      id: 'data-table',
      title: 'Advanced Data Table',
      description: 'Powerful data table with TanStack Table',
      icon: TableIcon,
      color: 'from-cyan-500 to-blue-600',
      href: '/dashboard/advanced/data-table',
      features: ['Sorting & filtering', 'Pagination', 'Row selection', 'Column visibility'],
    },
    {
      id: 'charts',
      title: 'Charts & Graphs',
      description: 'Beautiful charts with Recharts',
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-600',
      href: '/dashboard/advanced/charts',
      features: ['Line charts', 'Bar charts', 'Pie charts', 'Area charts'],
    },
    {
      id: 'kanban',
      title: 'Kanban Board',
      description: 'Drag & drop task management with DnD Kit',
      icon: Columns3,
      color: 'from-orange-500 to-red-600',
      href: '/dashboard/advanced/kanban',
      features: ['Drag & drop cards', 'Multiple columns', 'Task priorities', 'Assignees & tags'],
    },
    {
      id: 'calendar',
      title: 'Event Calendar',
      description: 'Full-featured calendar with React Big Calendar',
      icon: CalendarIcon,
      color: 'from-rose-500 to-pink-600',
      href: '/dashboard/advanced/calendar',
      features: ['Month/Week/Day views', 'Event management', 'Drag & drop', 'Custom styling'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            Advanced Components
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl">
            Premium components powered by industry-standard libraries: SweetAlert2, React Hot Toast, 
            React Select, TanStack Table, Recharts, DnD Kit, and React Big Calendar.
          </p>
        </motion.div>
      </div>

      {/* Components Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((component, index) => {
            const Icon = component.icon;
            return (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={component.href}>
                  <div className="group h-full p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 cursor-pointer">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${component.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {component.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                      {component.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2">
                      {component.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600">
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* View Demo Link */}
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                        View Demo →
                      </span>
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
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-6"
        >
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-1">6</div>
            <div className="text-sm text-neutral-600">Advanced Components</div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-1">8</div>
            <div className="text-sm text-neutral-600">External Libraries</div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-1">100%</div>
            <div className="text-sm text-neutral-600">TypeScript</div>
          </div>
        </motion.div>

        {/* Libraries Used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Libraries Used</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'SweetAlert2', desc: 'Beautiful modals' },
              { name: 'React Hot Toast', desc: 'Toast notifications' },
              { name: 'React Select', desc: 'Advanced dropdowns' },
              { name: 'TanStack Table', desc: 'Powerful tables' },
              { name: 'Recharts', desc: 'Chart library' },
              { name: 'DnD Kit', desc: 'Drag & drop' },
              { name: 'React Big Calendar', desc: 'Calendar views' },
              { name: 'date-fns', desc: 'Date utilities' },
            ].map((lib, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-neutral-200">
                <div className="text-sm font-bold text-neutral-900 mb-1">{lib.name}</div>
                <div className="text-xs text-neutral-600">{lib.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
