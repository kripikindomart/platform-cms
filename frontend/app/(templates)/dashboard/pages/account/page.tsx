'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Lock, Shield, Key, Smartphone, Monitor, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

/**
 * Account Settings Page
 * Account preferences, password change, and security settings
 */

export default function AccountSettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const sessions = [
    {
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.2',
      lastActive: '1 hour ago',
      current: false,
    },
    {
      device: 'Chrome on Windows',
      location: 'New York, NY',
      ip: '192.168.2.1',
      lastActive: '2 days ago',
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
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
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Account Settings</h1>
          <p className="text-lg text-neutral-600">
            Manage your account security and preferences
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Change Password</h2>
                <p className="text-sm text-neutral-600">Update your password regularly</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Current Password
                </label>
                <Input type="password" placeholder="Enter current password" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  New Password
                </label>
                <Input type="password" placeholder="Enter new password" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Confirm New Password
                </label>
                <Input type="password" placeholder="Confirm new password" />
              </div>

              {/* Password Requirements */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="text-sm font-semibold text-neutral-700 mb-2">Password Requirements:</p>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    One number
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    One special character
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button variant="primary">Update Password</Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Two-Factor Authentication</h2>
                <p className="text-sm text-neutral-600">Add an extra layer of security</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-900">Enable 2FA</h3>
                  <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600">
                  Use authenticator app or SMS for additional security
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>

            {twoFactorEnabled && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-900">Authenticator App Connected</h4>
                </div>
                <p className="text-sm text-emerald-700 mb-3">
                  Your account is protected with Google Authenticator
                </p>
                <Button variant="outline" size="sm">
                  View Backup Codes
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Active Sessions</h2>
                <p className="text-sm text-neutral-600">Manage your active sessions</p>
              </div>
            </div>

            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-900">{session.device}</h4>
                        {session.current && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Key className="w-3.5 h-3.5" />
                          {session.ip}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Security tip:</strong> If you see any suspicious activity, revoke the session and change your password immediately.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Email Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Email Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Email Notifications</h3>
                  <p className="text-sm text-neutral-600">
                    Receive notifications about account activity
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Marketing Emails</h3>
                  <p className="text-sm text-neutral-600">
                    Receive updates about new features and offers
                  </p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-xl font-bold text-rose-600 mb-6">Danger Zone</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Deactivate Account</h3>
                  <p className="text-sm text-neutral-600">
                    Temporarily disable your account
                  </p>
                </div>
                <Button variant="outline">Deactivate</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Delete Account</h3>
                  <p className="text-sm text-neutral-600">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="danger">Delete</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
