'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Smartphone, Key, Clock, MapPin, Globe, Monitor, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

/**
 * Security Settings Page
 * Two-factor authentication, sessions, and security log
 */

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [backupCodesGenerated, setBackupCodesGenerated] = useState(false);

  const securityLogs = [
    {
      action: 'Login',
      device: 'Chrome on MacBook Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      action: 'Password Changed',
      device: 'Chrome on MacBook Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      time: '2 hours ago',
      status: 'success',
    },
    {
      action: 'Failed Login Attempt',
      device: 'Unknown Device',
      location: 'New York, NY',
      ip: '192.168.2.5',
      time: '1 day ago',
      status: 'failed',
    },
    {
      action: '2FA Enabled',
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.2',
      time: '3 days ago',
      status: 'success',
    },
  ];

  const activeSessions = [
    {
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      lastActive: 'Active now',
      current: true,
    },
    {
      device: 'iPhone 14 Pro',
      browser: 'Safari Mobile',
      location: 'San Francisco, CA',
      ip: '192.168.1.2',
      lastActive: '2 hours ago',
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
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Security Settings</h1>
          <p className="text-lg text-neutral-600">
            Manage your account security and monitor activity
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Two-Factor Authentication</h2>
                <p className="text-sm text-neutral-600">Add an extra layer of security to your account</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-emerald-900">2FA Status</h3>
                  <Badge variant="default" className="bg-emerald-600">Enabled</Badge>
                </div>
                <p className="text-sm text-emerald-700">Your account is protected with Google Authenticator</p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>

            {twoFactorEnabled && (
              <div className="space-y-4">
                {/* Authenticator App */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-neutral-900">Authenticator App</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Use Google Authenticator or similar apps to generate verification codes
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reconfigure</Button>
                    <Button variant="outline" size="sm">Change App</Button>
                  </div>
                </div>

                {/* Backup Codes */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-neutral-900">Backup Codes</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Generate backup codes to use if you lose access to your authenticator app
                  </p>
                  {backupCodesGenerated ? (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-3">
                      <p className="text-xs font-mono text-amber-900 space-y-1">
                        <span className="block">1. ABCD-EFGH-IJKL</span>
                        <span className="block">2. MNOP-QRST-UVWX</span>
                        <span className="block">3. YZAB-CDEF-GHIJ</span>
                      </p>
                    </div>
                  ) : null}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setBackupCodesGenerated(true)}
                  >
                    {backupCodesGenerated ? 'Regenerate Codes' : 'Generate Codes'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Active Sessions</h2>
                <p className="text-sm text-neutral-600">Manage your active login sessions</p>
              </div>
              <Button variant="outline" size="sm">Revoke All</Button>
            </div>

            <div className="space-y-3">
              {activeSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200"
                >
                  <div className="flex gap-3">
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
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-600 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {session.browser}
                        </p>
                        <p className="text-sm text-neutral-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {session.location} • {session.ip}
                        </p>
                        <p className="text-sm text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.lastActive}
                        </p>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="outline" size="sm">Revoke</Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Security Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Security Activity Log</h2>
                <p className="text-sm text-neutral-600">Recent security-related activities on your account</p>
              </div>
              <Button variant="outline" size="sm">Export Log</Button>
            </div>

            <div className="space-y-2">
              {securityLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 hover:bg-neutral-50 rounded-xl border border-transparent hover:border-neutral-200 transition-all"
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.status === 'success' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-rose-100 text-rose-600'
                    }`}>
                      {log.status === 'success' ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">{log.action}</h4>
                      <div className="space-y-0.5">
                        <p className="text-sm text-neutral-600">{log.device}</p>
                        <p className="text-sm text-neutral-600">{log.location} • {log.ip}</p>
                        <p className="text-xs text-neutral-500">{log.time}</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">Security Tip</p>
                  <p className="text-sm text-amber-800">
                    If you notice any suspicious activity, immediately change your password and enable two-factor authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200 p-8"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Security Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Shield, text: 'Use a strong, unique password', done: true },
              { icon: Smartphone, text: 'Enable two-factor authentication', done: true },
              { icon: Key, text: 'Keep backup codes in a safe place', done: false },
              { icon: Clock, text: 'Review login activity regularly', done: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-neutral-700">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
