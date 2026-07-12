'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Plus,
  Hexagon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface CompactSidebarProps {
  className?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '#', active: true },
  { icon: LayoutDashboard, label: 'Dashboard', href: '#' },
  { icon: Users, label: 'Users', href: '#' },
  { icon: FileText, label: 'Documents', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

export function CompactSidebar({ className }: CompactSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <aside
      className={cn(
        'w-20 h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex flex-col items-center py-6 gap-6',
        className
      )}
    >
      {/* Logo */}
      <Link
        href="#"
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform duration-200"
      >
        <Hexagon className="w-6 h-6 text-white" />
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-3">
        {navItems.map((item, index) => (
          <div key={index} className="relative">
            <Link
              href={item.href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                'w-full h-14 rounded-2xl flex items-center justify-center transition-all duration-200 relative group',
                item.active
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon className="w-6 h-6" />

              {/* Active Indicator */}
              {item.active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -left-3 w-1 h-8 bg-white rounded-r-full"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              )}
            </Link>

            {/* Tooltip */}
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-neutral-900 text-white text-sm font-medium rounded-xl shadow-xl border border-white/10 whitespace-nowrap z-50"
              >
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-neutral-900" />
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Quick Action */}
      <button className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200">
        <Plus className="w-6 h-6" />
      </button>

      {/* User Avatar */}
      <div className="relative group">
        <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold text-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
          JD
        </button>

        {/* User Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute left-full ml-3 bottom-0 px-4 py-3 bg-neutral-900 text-white rounded-xl shadow-xl border border-white/10 whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <p className="text-sm font-semibold mb-0.5">John Doe</p>
          <p className="text-xs text-white/60">john@company.com</p>
          <div className="absolute right-full top-4 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-neutral-900" />
        </motion.div>
      </div>
    </aside>
  );
}
