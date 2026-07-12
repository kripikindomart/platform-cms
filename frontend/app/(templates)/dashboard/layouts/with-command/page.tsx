'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { CommandPalette } from '@/components/templates/layouts/command-palette';

export default function CommandPaletteLayoutPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Layout with Command Palette
            </h1>
            <p className="text-neutral-600 mb-4">
              Press <kbd className="px-2 py-1 bg-neutral-200 rounded text-sm font-semibold">⌘ K</kbd> or{' '}
              <kbd className="px-2 py-1 bg-neutral-200 rounded text-sm font-semibold">Ctrl K</kbd> to open command palette
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="h-10 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
            >
              Open Command Palette
            </button>
          </div>

          {/* Demo Content */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Features
              </h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>✓ Global search with keyboard shortcuts</li>
                <li>✓ Grouped results (Pages, Actions, Recent)</li>
                <li>✓ Keyboard navigation (↑↓ Enter Esc)</li>
                <li>✓ Recent searches memory</li>
                <li>✓ Quick actions</li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Open palette</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-semibold">
                    ⌘ K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Navigate</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-semibold">
                    ↑ ↓
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Select</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-semibold">
                    Enter
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Close</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-semibold">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}
