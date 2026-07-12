'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';

export default function FloatingSidebarLayoutPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      {/* Sidebar */}
      <FloatingSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Floating Sidebar Layout
            </h1>
            <p className="text-neutral-600">
              Elevated sidebar with shadow and gradient design
            </p>
          </div>

          {/* Demo Content */}
          <div className="grid gap-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: '2,543', change: '+12.5%' },
                { label: 'Revenue', value: '$45.2K', change: '+8.2%' },
                { label: 'Orders', value: '1,234', change: '+15.3%' },
                { label: 'Conversion', value: '3.24%', change: '-2.4%' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900 mb-2">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      stat.change.startsWith('+')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Content Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-900">
                          Activity Item {i + 1}
                        </p>
                        <p className="text-xs text-neutral-500">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Create', 'Upload', 'Share', 'Export'].map((action, i) => (
                    <button
                      key={i}
                      className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-sm font-semibold text-neutral-700 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
