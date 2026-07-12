'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, LayoutDashboard, Users, Settings, FileText, ChevronDown, type LucideIcon } from 'lucide-react';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Documents', url: '/documents', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export interface FloatingSidebarProps {
  menuItems?: MenuItem[];
  brandName?: string;
  user?: { name: string; email: string };
  className?: string;
}

export function FloatingSidebar({
  menuItems = defaultMenuItems,
  brandName = 'Platform',
  user = { name: 'Admin User', email: 'admin@company.com' },
  className,
}: FloatingSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'w-64 h-[calc(100vh-2rem)] m-4 flex flex-col bg-white rounded-2xl border border-neutral-200 shadow-xl',
        className
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900">{brandName}</h1>
            <p className="text-xs text-neutral-500">Enterprise</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            const hasChildren = item.items && item.items.length > 0;
            const isExpanded = expandedItems.includes(item.url);

            return (
              <div key={item.url}>
                {hasChildren ? (
                  <button
                    onClick={() => setExpandedItems(prev => prev.includes(item.url) ? prev.filter(u => u !== item.url) : [...prev, item.url])}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' : 'text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                  </button>
                ) : (
                  <Link
                    href={item.url}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm' : 'text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.title}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-all cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
