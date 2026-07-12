'use client';

import { CompactSidebar } from '@/components/templates/layouts/compact-sidebar';

export default function CompactSidebarLayoutPage() {
  return (
    <div className="flex min-h-screen">
      {/* Compact Sidebar (Dark) */}
      <CompactSidebar />

      {/* Main Content */}
      <main className="flex-1 bg-[#FAFBFC] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Compact Sidebar Layout
            </h1>
            <p className="text-neutral-600">
              Icon-only sidebar (80px) with dark gradient background
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid gap-6">
            {/* Large Card */}
            <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Welcome Back! 👋
              </h2>
              <p className="text-neutral-600 mb-6">
                This is a compact layout perfect for dashboards that need maximum content space.
              </p>
              <button className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
                Get Started
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Projects', value: '24', icon: '📁' },
                { title: 'Tasks', value: '156', icon: '✓' },
                { title: 'Team', value: '12', icon: '👥' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-6 bg-white rounded-2xl border border-neutral-200"
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
