'use client';

import { Bell, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="h-16 border-b border-neutral-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <button className="w-full max-w-md group">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-all duration-200">
              <Search className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-500 flex-1 text-left">Search or jump to...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-neutral-200 text-xs font-medium text-neutral-500">
                <Command className="h-3 w-3" />
                <span>K</span>
              </kbd>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon"
            className="relative h-10 w-10 rounded-xl hover:bg-neutral-100"
          >
            <Bell className="h-5 w-5 text-neutral-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-200 mx-2" />

          {/* User Avatar */}
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              AU
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
