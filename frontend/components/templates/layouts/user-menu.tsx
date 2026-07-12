'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, CreditCard, HelpCircle, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UserMenuProps {
  user?: { name: string; email: string; avatar?: string; role?: string };
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onBillingClick?: () => void;
  onHelpClick?: () => void;
  onLogoutClick?: () => void;
  className?: string;
}

export function UserMenu({
  user = { name: 'Admin User', email: 'admin@company.com', role: 'Administrator' },
  onProfileClick,
  onSettingsClick,
  onBillingClick,
  onHelpClick,
  onLogoutClick,
  className,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: User, label: 'Profile', onClick: onProfileClick },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick },
    { icon: CreditCard, label: 'Billing', onClick: onBillingClick },
    { icon: HelpCircle, label: 'Help & Support', onClick: onHelpClick },
  ];

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 rounded-xl transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
          {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" /> : user.name.split(' ').map((n) => n[0]).join('')}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl border border-neutral-200 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" /> : user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                </div>
                {user.role && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg">
                    <Shield className="w-3 h-3 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-700">{user.role}</span>
                  </div>
                )}
              </div>

              <div className="p-2">
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-neutral-200">
                <button
                  onClick={() => {
                    onLogoutClick?.();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-neutral-600 group-hover:text-red-600" />
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-red-700">Sign out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
