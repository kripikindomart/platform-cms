'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type MenuItem, menuItems } from '@/config/menu';

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (url: string) => {
    setExpandedItems((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = item.icon;
    const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.url);

    return (
      <div key={item.url} className="mb-1">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.url)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'hover:bg-neutral-100',
                isActive ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' : 'text-neutral-700',
                level > 0 && 'pl-11'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.title}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-neutral-100 pl-2">
                    {item.items!.map((child) => renderMenuItem(child, level + 1))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Link
            href={item.url}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              'hover:bg-neutral-100',
              isActive
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                : 'text-neutral-700',
              level > 0 && 'pl-11'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md">
                {item.badge}
              </span>
            )}
            {isActive && !item.badge && (
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </Link>
        )}
      </div>
    );
  };

  return (
    <aside className="w-72 h-screen sticky top-0 flex flex-col bg-white border-r border-neutral-100">
      {/* Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900">Platform CMS</h1>
            <p className="text-xs text-neutral-500">Enterprise</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      {/* Bottom Section - User */}
      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-all cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">Admin User</p>
            <p className="text-xs text-neutral-500 truncate">admin@demo.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
