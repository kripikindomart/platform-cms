'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  Hexagon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface CollapsibleSidebarProps {
  defaultCollapsed?: boolean;
  className?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '#', active: true },
  { icon: LayoutDashboard, label: 'Dashboard', href: '#' },
  { icon: Users, label: 'Users', href: '#', badge: '12' },
  { icon: FileText, label: 'Documents', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

export function CollapsibleSidebar({
  defaultCollapsed = false,
  className,
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? '80px' : '280px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'relative h-screen bg-white border-r border-neutral-200 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Hexagon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-neutral-900">Platform</span>
                <span className="text-xs text-neutral-500">CMS</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto"
            >
              <Hexagon className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-4"
        >
          <button className="w-full h-10 px-3 flex items-center gap-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-600 text-sm">
            <Search className="w-4 h-4 flex-shrink-0" />
            <span>Search...</span>
            <kbd className="ml-auto px-2 py-1 text-xs bg-white rounded border border-neutral-200">
              ⌘K
            </kbd>
          </button>
        </motion.div>
      )}

      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-4"
        >
          <button className="w-full h-10 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <Search className="w-5 h-5 text-neutral-600" />
          </button>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 h-12 rounded-xl transition-all duration-200',
                item.active
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isCollapsed && item.badge && (
                <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-600 rounded-lg">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-neutral-200">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                John Doe
              </p>
              <p className="text-xs text-neutral-500 truncate">john@company.com</p>
            </div>
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        ) : (
          <button className="w-full flex justify-center p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>
          </button>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-600" />
        )}
      </button>
    </motion.aside>
  );
}
