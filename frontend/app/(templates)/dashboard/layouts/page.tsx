'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Layout,
  Sidebar,
  Menu,
  Navigation,
  Command,
  Building2,
  Bell,
  Search,
  User,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function LayoutsPage() {
  const components = [
    {
      id: 'floating-sidebar',
      title: 'Floating Sidebar',
      description: 'Elevated sidebar with shadow and gradient',
      icon: Sidebar,
      color: 'from-indigo-500 to-purple-600',
      status: 'ready',
    },
    {
      id: 'collapsible-sidebar',
      title: 'Collapsible Sidebar',
      description: 'Sidebar that collapses to mini mode',
      icon: Menu,
      color: 'from-cyan-500 to-blue-600',
      status: 'ready',
    },
    {
      id: 'compact-sidebar',
      title: 'Compact Sidebar',
      description: 'Dark gradient icon-only sidebar',
      icon: Layers,
      color: 'from-green-500 to-emerald-600',
      status: 'ready',
    },
    {
      id: 'horizontal-nav',
      title: 'Horizontal Navigation',
      description: 'Top navigation bar with tabs',
      icon: Navigation,
      color: 'from-amber-500 to-orange-600',
      status: 'ready',
    },
    {
      id: 'header',
      title: 'Header Component',
      description: 'Sticky header with backdrop blur',
      icon: Layout,
      color: 'from-rose-500 to-pink-600',
      status: 'ready',
    },
    {
      id: 'footer',
      title: 'Footer Component',
      description: '3 variants: minimal, default, full',
      icon: Layout,
      color: 'from-purple-500 to-fuchsia-600',
      status: 'ready',
    },
    {
      id: 'command-palette',
      title: 'Command Palette',
      description: 'Cmd+K search with keyboard navigation',
      icon: Command,
      color: 'from-blue-500 to-indigo-600',
      status: 'ready',
    },
    {
      id: 'workspace-switcher',
      title: 'Workspace Switcher',
      description: 'Switch between workspaces with search',
      icon: Briefcase,
      color: 'from-violet-500 to-purple-600',
      status: 'ready',
    },
    {
      id: 'organization-switcher',
      title: 'Organization Switcher',
      description: 'Multi-org support with role badges',
      icon: Building2,
      color: 'from-cyan-500 to-teal-600',
      status: 'ready',
    },
    {
      id: 'notification-center',
      title: 'Notification Center',
      description: 'Bell icon with slide-out panel',
      icon: Bell,
      color: 'from-emerald-500 to-green-600',
      status: 'ready',
    },
    {
      id: 'user-menu',
      title: 'User Menu',
      description: 'Avatar dropdown with profile menu',
      icon: User,
      color: 'from-amber-500 to-yellow-600',
      status: 'ready',
    },
    {
      id: 'global-search',
      title: 'Global Search',
      description: 'Instant search with recent & trending',
      icon: Search,
      color: 'from-rose-500 to-red-600',
      status: 'ready',
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
            <h1 className="text-lg font-bold text-neutral-900">Layout Components</h1>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-semibold mb-4">
            <Layout className="w-4 h-4" />
            22 Items (12 Components + 10 Layouts)
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Layout Components & Templates
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Production-ready layout components including sidebars, navigation,
            headers, and more. Mix and match to create your perfect dashboard layout.
          </p>
        </motion.div>

        {/* Components Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Components</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {components.map((component, index) => {
              const Icon = component.icon;
              return (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="group h-full p-4 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${component.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-bold text-neutral-900 mb-1">
                      {component.title}
                    </h3>
                    <p className="text-xs text-neutral-600 mb-3">
                      {component.description}
                    </p>

                    {/* Status */}
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg">
                      ✓ Ready
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Layouts Section */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Complete Layouts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'floating', title: 'Floating Sidebar', desc: 'Elevated sidebar with shadow' },
              { id: 'collapsible', title: 'Collapsible Sidebar', desc: 'Sidebar that collapses' },
              { id: 'compact', title: 'Compact Sidebar', desc: 'Dark icon-only sidebar' },
              { id: 'horizontal', title: 'Horizontal Nav', desc: 'Top navigation bar' },
              { id: 'header-footer', title: 'Header + Footer', desc: 'Marketing layout' },
              { id: 'with-command', title: 'With Command Palette', desc: 'Cmd+K search' },
              { id: 'with-workspace', title: 'With Workspace', desc: 'Multi-workspace' },
              { id: 'with-notifications', title: 'With Notifications', desc: 'Notification center' },
              { id: 'with-search', title: 'With Search', desc: 'Global search' },
              { id: 'minimal', title: 'Minimal', desc: 'Clean minimal layout' },
            ].map((layout, index) => (
              <motion.div
                key={layout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Link href={`/dashboard/layouts/${layout.id}`}>
                  <div className="group h-full p-6 bg-white rounded-2xl border border-neutral-200 hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <Layout className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg">
                        Ready
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {layout.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {layout.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-neutral-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Mix & Match Components
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                All components are designed to work together seamlessly. Combine them
                to create your perfect dashboard layout. Complete layout page examples
                coming soon!
              </p>
              <Link
                href="/portal/components"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View Component Library
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
