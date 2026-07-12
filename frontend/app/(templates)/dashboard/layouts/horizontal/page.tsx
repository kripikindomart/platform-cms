'use client';

import { HorizontalNav } from '@/components/templates/layouts/horizontal-nav';

export default function HorizontalNavLayoutPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Top Navigation */}
      <HorizontalNav />

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Horizontal Navigation Layout
            </h1>
            <p className="text-neutral-600">
              Top navigation bar with tab-style menu and search
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl border border-neutral-200 hover:border-indigo-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Item {i + 1}</h3>
                <p className="text-sm text-neutral-600">
                  Content card with horizontal nav layout
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
