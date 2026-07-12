'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Settings, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  avatar?: string;
}

export interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClear?: (id: string) => void;
  className?: string;
}

const defaultNotifications: Notification[] = [
  { id: '1', title: 'New user registered', message: 'John Doe just signed up', time: '2m ago', read: false, type: 'info' },
  { id: '2', title: 'Payment received', message: 'Invoice #1234 paid', time: '1h ago', read: false, type: 'success' },
  { id: '3', title: 'Server maintenance', message: 'Scheduled for tonight', time: '3h ago', read: true, type: 'warning' },
];

export function NotificationCenter({
  notifications = defaultNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-10 w-10 rounded-xl hover:bg-neutral-100 flex items-center justify-center transition-colors"
      >
        <Bell className="h-5 w-5 text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl border border-neutral-200 shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                <h3 className="text-sm font-bold text-neutral-900">
                  Notifications {unreadCount > 0 && <span className="text-indigo-600">({unreadCount})</span>}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4 text-neutral-600" />
                    </button>
                  )}
                  <button className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-neutral-600" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900 mb-1">No notifications</p>
                    <p className="text-sm text-neutral-500">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-b border-neutral-100 last:border-0 transition-colors',
                        !notification.read && 'bg-indigo-50/50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          notification.type === 'success' && 'bg-green-50',
                          notification.type === 'warning' && 'bg-yellow-50',
                          notification.type === 'error' && 'bg-red-50',
                          notification.type === 'info' && 'bg-blue-50'
                        )}
                      >
                        {notification.avatar ? (
                          <img src={notification.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              notification.type === 'success' && 'bg-green-500',
                              notification.type === 'warning' && 'bg-yellow-500',
                              notification.type === 'error' && 'bg-red-500',
                              notification.type === 'info' && 'bg-blue-500'
                            )}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 mb-0.5">{notification.title}</p>
                        <p className="text-sm text-neutral-600 mb-1">{notification.message}</p>
                        <p className="text-xs text-neutral-500">{notification.time}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead?.(notification.id)}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-neutral-400" />
                          </button>
                        )}
                        <button
                          onClick={() => onClear?.(notification.id)}
                          className="p-1.5 hover:bg-white rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
