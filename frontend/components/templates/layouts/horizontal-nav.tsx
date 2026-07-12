'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Hexagon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface HorizontalNavProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  hasDropdown?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#', active: true },
  { label: 'Dashboard', href: '#' },
  { label: 'Projects', href: '#', hasDropdown: true },
  { label: 'Team', href: '#' },
  { label: 'Reports', href: '#', hasDropdown: true },
];

export function HorizontalNav({ className }: HorizontalNavProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState(3);

  return (
    <header
      className={cn(
        'w-full h-16 bg-white border-b border-neutral-200 px-6',
        className
      )}
    >
      <div className="max-w-[1920px] mx-auto h-full flex items-center justify-between gap-8">
        {/* Left: Logo */}
        <Link href="#" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-neutral-900">Platform</span>
            <span className="text-xs text-neutral-500">CMS</span>
          </div>
        </Link>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-1 flex-1 max-w-2xl">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setActiveTab(index)}
              className={cn(
                'relative px-4 h-10 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200',
                activeTab === index
                  ? 'text-indigo-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              )}
            >
              <span>{item.label}</span>
              {item.hasDropdown && (
                <ChevronDown className="w-4 h-4 opacity-50" />
              )}

              {/* Active Indicator */}
              {activeTab === index && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <button className="h-10 px-4 flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-600 text-sm">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline-flex ml-2 px-2 py-1 text-xs bg-white rounded border border-neutral-200">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-neutral-600" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                {notifications}
              </span>
            )}
          </button>

          {/* User Menu */}
          <button className="flex items-center gap-3 h-10 pl-2 pr-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
              JD
            </div>
            <span className="hidden md:inline text-sm font-medium text-neutral-900">
              John Doe
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
