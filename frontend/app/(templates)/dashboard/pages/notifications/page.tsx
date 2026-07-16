'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, MessageSquare, CheckCircle, AlertCircle, User, CreditCard } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

/**
 * Notifications Settings Page
 * Notification preferences and activity center
 */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    email: {
      comments: true,
      mentions: true,
      followers: false,
      messages: true,
      updates: true,
      newsletter: false,
    },
    push: {
      comments: true,
      mentions: true,
      followers: false,
      messages: true,
    },
    desktop: {
      enabled: true,
      sound: true,
    },
  });

  const activities = [
    {
      type: 'comment',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-600',
      title: 'New comment on your post',
      description: 'Sarah commented on "Design System Guidelines"',
      time: '5 minutes ago',
      read: false,
    },
    {
      type: 'mention',
      icon: User,
      color: 'from-purple-500 to-pink-600',
      title: 'You were mentioned',
      description: 'John mentioned you in a comment',
      time: '1 hour ago',
      read: false,
    },
    {
      type: 'success',
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      title: 'Payment successful',
      description: 'Your subscription has been renewed',
      time: '2 hours ago',
      read: true,
    },
    {
      type: 'follower',
      icon: User,
      color: 'from-indigo-500 to-purple-600',
      title: 'New follower',
      description: 'Emma started following you',
      time: '3 hours ago',
      read: true,
    },
    {
      type: 'alert',
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-600',
      title: 'Security alert',
      description: 'New login from Chrome on Windows',
      time: '1 day ago',
      read: true,
    },
  ];

  const toggleNotification = (category: 'email' | 'push' | 'desktop', key: string) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !(prev[category] as any)[key],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Notifications</h1>
          <p className="text-lg text-neutral-600">
            Manage your notification preferences and activity
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Email Notifications</h2>
                  <p className="text-sm text-neutral-600">Receive notifications via email</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Comments</h3>
                    <p className="text-sm text-neutral-600">Get notified when someone comments on your posts</p>
                  </div>
                  <Switch
                    checked={notifications.email.comments}
                    onCheckedChange={() => toggleNotification('email', 'comments')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Mentions</h3>
                    <p className="text-sm text-neutral-600">Get notified when someone mentions you</p>
                  </div>
                  <Switch
                    checked={notifications.email.mentions}
                    onCheckedChange={() => toggleNotification('email', 'mentions')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">New Followers</h3>
                    <p className="text-sm text-neutral-600">Get notified when someone follows you</p>
                  </div>
                  <Switch
                    checked={notifications.email.followers}
                    onCheckedChange={() => toggleNotification('email', 'followers')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Direct Messages</h3>
                    <p className="text-sm text-neutral-600">Get notified when you receive a message</p>
                  </div>
                  <Switch
                    checked={notifications.email.messages}
                    onCheckedChange={() => toggleNotification('email', 'messages')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Product Updates</h3>
                    <p className="text-sm text-neutral-600">Get notified about new features and updates</p>
                  </div>
                  <Switch
                    checked={notifications.email.updates}
                    onCheckedChange={() => toggleNotification('email', 'updates')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Newsletter</h3>
                    <p className="text-sm text-neutral-600">Receive our weekly newsletter</p>
                  </div>
                  <Switch
                    checked={notifications.email.newsletter}
                    onCheckedChange={() => toggleNotification('email', 'newsletter')}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Push Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Push Notifications</h2>
                  <p className="text-sm text-neutral-600">Receive notifications on your device</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Comments</h3>
                    <p className="text-sm text-neutral-600">Real-time notifications for comments</p>
                  </div>
                  <Switch
                    checked={notifications.push.comments}
                    onCheckedChange={() => toggleNotification('push', 'comments')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Mentions</h3>
                    <p className="text-sm text-neutral-600">Real-time notifications for mentions</p>
                  </div>
                  <Switch
                    checked={notifications.push.mentions}
                    onCheckedChange={() => toggleNotification('push', 'mentions')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">New Followers</h3>
                    <p className="text-sm text-neutral-600">Real-time notifications for followers</p>
                  </div>
                  <Switch
                    checked={notifications.push.followers}
                    onCheckedChange={() => toggleNotification('push', 'followers')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Direct Messages</h3>
                    <p className="text-sm text-neutral-600">Real-time notifications for messages</p>
                  </div>
                  <Switch
                    checked={notifications.push.messages}
                    onCheckedChange={() => toggleNotification('push', 'messages')}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden sticky top-8"
          >
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-neutral-900">Recent Activity</h2>
                <Button variant="ghost" size="sm">Mark all read</Button>
              </div>
              <p className="text-sm text-neutral-600">Last 24 hours</p>
            </div>

            <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                      !activity.read ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 text-sm mb-1">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-neutral-600 mb-1 line-clamp-2">
                          {activity.description}
                        </p>
                        <span className="text-xs text-neutral-500">{activity.time}</span>
                      </div>
                      {!activity.read && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-neutral-100">
              <Button variant="outline" className="w-full">
                View All Notifications
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
