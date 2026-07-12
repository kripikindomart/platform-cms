'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Clock, Star, File, Settings, Users, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
  shortcut?: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: CommandItem[];
  recentItems?: CommandItem[];
  className?: string;
}

const defaultItems: CommandItem[] = [
  { id: '1', title: 'Dashboard', description: 'View dashboard', icon: Star, category: 'Pages', action: () => console.log('Dashboard') },
  { id: '2', title: 'Users', description: 'Manage users', icon: Users, category: 'Pages', action: () => console.log('Users') },
  { id: '3', title: 'Settings', description: 'Configure settings', icon: Settings, category: 'Pages', action: () => console.log('Settings') },
  { id: '4', title: 'New Document', description: 'Create new document', icon: File, category: 'Actions', action: () => console.log('New doc') },
];

export function CommandPalette({ open, onOpenChange, items = defaultItems, recentItems = [], className }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(0);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }

      if (!open) return;

      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selected]) {
          filteredItems[selected].action();
          onOpenChange(false);
        }
      }
    },
    [open, onOpenChange, filteredItems, selected]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelected(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className={cn('w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden', className)}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-200">
                <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search or type a command..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelected(0);
                  }}
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-600">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {/* Recent Items */}
                {recentItems.length > 0 && !search && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recent</span>
                    </div>
                    {recentItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.action();
                            onOpenChange(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-neutral-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-semibold text-neutral-900">{item.title}</div>
                            {item.description && <div className="text-xs text-neutral-500">{item.description}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Grouped Results */}
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="px-3 py-2 text-xs font-semibold text-neutral-500">{category}</div>
                    {categoryItems.map((item, index) => {
                      const Icon = item.icon;
                      const globalIndex = filteredItems.indexOf(item);
                      const isSelected = globalIndex === selected;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.action();
                            onOpenChange(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                            isSelected ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-neutral-50'
                          )}
                        >
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', isSelected ? 'bg-indigo-100' : 'bg-neutral-100')}>
                            <Icon className={cn('w-5 h-5', isSelected ? 'text-indigo-600' : 'text-neutral-600')} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className={cn('text-sm font-semibold', isSelected ? 'text-indigo-900' : 'text-neutral-900')}>{item.title}</div>
                            {item.description && <div className="text-xs text-neutral-500">{item.description}</div>}
                          </div>
                          {item.shortcut && (
                            <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs font-semibold text-neutral-600">{item.shortcut}</kbd>
                          )}
                          {isSelected && <ArrowRight className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Empty State */}
                {filteredItems.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900 mb-1">No results found</p>
                    <p className="text-sm text-neutral-500">Try searching for something else</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-300">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-300">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-300">ESC</kbd>
                    <span>Close</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
