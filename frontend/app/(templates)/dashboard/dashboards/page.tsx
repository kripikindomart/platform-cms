'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutDashboard, BarChart3, TrendingUp, ShoppingCart, Users, FolderKanban } from 'lucide-react';

export default function DashboardsIndexPage() {
  const dashboards = [
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Complete analytics with charts and KPIs',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-600',
      href: '/dashboard/dashboards/analytics',
      status: 'ready',
    },
    {
      id: 'sales',
      title: 'Sales Dashboard',
      description: 'Track sales performance and revenue',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
      href: '/dashboard/dashboards/sales',
      status: 'ready',
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Dashboard',
      description: 'Orders, products, and customers',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-600',
      href: '/dashboard/dashboards/ecommerce',
      status: 'ready',
    },
    {
      id: 'crm',
      title: 'CRM Dashboard',
      description: 'Customer relationship management',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      href: '/dashboard/dashboards/crm',
      status: 'ready',
    },
    {
      id: 'project',
      title: 'Project Dashboard',
      description: 'Tasks, milestones, and team progress',
      icon: FolderKanban,
      color: 'from-rose-500 to-pink-600',
      href: '/dashboard/dashboards/project',
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
            <h1 className="text-lg font-bold text-neutral-900">Dashboard Templates</h1>
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
            <LayoutDashboard className="w-4 h-4" />
            5 Dashboard Types
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Dashboard Templates
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Production-ready dashboards for different use cases. Each includes
            stat cards, charts, and widgets optimized for their specific purpose.
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, index) => {
            const Icon = dashboard.icon;
            const isReady = dashboard.status === 'ready';

            return (
              <motion.div
                key={dashboard.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {isReady ? (
                  <Link href={dashboard.href}>
                    <div className="group h-full p-6 bg-white rounded-2xl border border-neutral-200 hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dashboard.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg">
                          Ready
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {dashboard.title}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {dashboard.description}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="h-full p-6 bg-white rounded-2xl border border-neutral-200">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dashboard.color} flex items-center justify-center shadow-lg opacity-50`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                      {dashboard.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {dashboard.description}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-neutral-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                What's Included?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-600">
                <ul className="space-y-2">
                  <li>✓ Stat cards with trends</li>
                  <li>✓ Revenue charts</li>
                  <li>✓ Activity timeline</li>
                </ul>
                <ul className="space-y-2">
                  <li>✓ Quick actions</li>
                  <li>✓ Recent users list</li>
                  <li>✓ Responsive design</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
