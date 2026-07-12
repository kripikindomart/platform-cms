'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { GlobalSearch } from '@/components/templates/layouts/global-search';

export default function SearchLayoutPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Layout with Global Search
            </h1>
            <p className="text-neutral-600 mb-6">
              Instant search with recent and trending searches
            </p>

            {/* Global Search Component */}
            <GlobalSearch />
          </div>

          {/* Search Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-neutral-900 mb-2">Instant Search</h3>
              <p className="text-sm text-neutral-600">
                Search results appear as you type with smart ranking
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-bold text-neutral-900 mb-2">Recent Searches</h3>
              <p className="text-sm text-neutral-600">
                Quick access to your recent search queries
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <div className="text-3xl mb-3">🔥</div>
              <h3 className="font-bold text-neutral-900 mb-2">Trending</h3>
              <p className="text-sm text-neutral-600">
                See what's popular across your organization
              </p>
            </div>
          </div>

          {/* Example Search Results */}
          <div className="mt-8 p-6 bg-white rounded-2xl border border-neutral-200">
            <h3 className="font-bold text-neutral-900 mb-4">
              Example Search Results
            </h3>
            <div className="space-y-3">
              {[
                'User Dashboard',
                'Analytics Report',
                'Project Settings',
                'Team Members',
              ].map((result, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{result}</p>
                    <p className="text-xs text-neutral-500">
                      /dashboard/{result.toLowerCase().replace(/\s+/g, '-')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
