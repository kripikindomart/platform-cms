'use client';

import { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  Plus,
  ChevronDown,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Hexagon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export function Header({
  onMenuClick,
  showMenuButton = true,
  className,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState(5);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-200 px-6',
        className
      )}
    >
      <div className="h-full flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Toggle (Mobile) */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-neutral-600" />
            </button>
          )}

          {/* Logo */}
          <Link href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-bold text-neutral-900">
                Platform
              </span>
              <span className="text-xs text-neutral-500">CMS</span>
            </div>
          </Link>

          {/* Breadcrumb / Page Title */}
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-neutral-200">
            <span className="text-sm text-neutral-500">Dashboard</span>
            <span className="text-neutral-300">/</span>
            <span className="text-sm font-semibold text-neutral-900">
              Overview
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="hidden md:flex items-center gap-2 h-10 px-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-600 text-sm">
            <Search className="w-4 h-4" />
            <span>Search</span>
            <kbd className="ml-2 px-2 py-1 text-xs bg-white rounded border border-neutral-200">
              ⌘K
            </kbd>
          </button>

          {/* Search Icon (Mobile) */}
          <button className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-neutral-100 rounded-xl transition-colors">
            <Search className="w-5 h-5 text-neutral-600" />
          </button>

          {/* Quick Action Button */}
          <button className="h-10 px-4 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 font-semibold text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center hover:bg-neutral-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5 text-neutral-600" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 h-10 pl-2 pr-3 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                JD
              </div>
              <span className="hidden lg:inline text-sm font-medium text-neutral-900">
                John Doe
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-500 transition-transform',
                  showUserMenu && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />

                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900">
                        John Doe
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        john@company.com
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {[
                        { icon: User, label: 'Profile', href: '#' },
                        { icon: Settings, label: 'Settings', href: '#' },
                        { icon: HelpCircle, label: 'Help & Support', href: '#' },
                      ].map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-sm text-neutral-700 hover:text-neutral-900"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-neutral-100">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm text-red-600 hover:text-red-700 font-medium">
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
