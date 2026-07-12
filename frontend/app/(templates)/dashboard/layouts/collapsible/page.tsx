'use client';

import { CollapsibleSidebar } from '@/components/templates/layouts/collapsible-sidebar';

export default function CollapsibleSidebarLayoutPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      {/* Sidebar */}
      <CollapsibleSidebar defaultCollapsed={false} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Collapsible Sidebar Layout
            </h1>
            <p className="text-neutral-600">
              Click the toggle button on sidebar to collapse/expand (280px ↔ 80px)
            </p>
          </div>

          {/* Demo Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl border border-neutral-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  Card Title {i + 1}
                </h3>
                <p className="text-sm text-neutral-600">
                  This is a demo card content. Sidebar can collapse to save space.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
