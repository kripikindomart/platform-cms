'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { FormSection, FormField, FormSuccess } from '@/components/templates/forms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, Bell, Lock, Mail, Loader2 } from 'lucide-react';

export default function SettingsFormPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [generalData, setGeneralData] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    productUpdates: false,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation based on active tab
    if (activeTab === 'general') {
      const newErrors: Record<string, string> = {};
      if (!generalData.displayName) newErrors.displayName = 'Display name is required';
      if (!generalData.username) newErrors.username = 'Username is required';
      if (!generalData.email) newErrors.email = 'Email is required';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (activeTab === 'security') {
      const newErrors: Record<string, string> = {};
      if (securityData.newPassword && !securityData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (securityData.newPassword && securityData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (securityData.newPassword !== securityData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFC]">
        <FloatingSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <FormSuccess
              title="Settings Updated!"
              message="Your account settings have been successfully saved."
              actionLabel="Close"
              onAction={() => setIsSuccess(false)}
            />
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Settings Form
            </h1>
            <p className="text-neutral-600">
              Multi-section settings with tabs for different categories.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* General Settings */}
            {activeTab === 'general' && (
              <FormSection
                title="General Settings"
                description="Manage your account information"
                icon={Settings}
              >
                <FormField label="Display Name" required error={errors.displayName}>
                  <Input
                    value={generalData.displayName}
                    onChange={(e) =>
                      setGeneralData({ ...generalData, displayName: e.target.value })
                    }
                    placeholder="John Doe"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>

                <FormField label="Username" required error={errors.username}>
                  <Input
                    value={generalData.username}
                    onChange={(e) =>
                      setGeneralData({ ...generalData, username: e.target.value })
                    }
                    placeholder="johndoe"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>

                <FormField label="Email" required error={errors.email}>
                  <Input
                    type="email"
                    value={generalData.email}
                    onChange={(e) =>
                      setGeneralData({ ...generalData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>

                <FormField label="Bio" hint="Brief description about yourself">
                  <Textarea
                    value={generalData.bio}
                    onChange={(e) =>
                      setGeneralData({ ...generalData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </FormSection>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <FormSection
                title="Notification Preferences"
                description="Choose what updates you want to receive"
                icon={Bell}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Email Notifications
                      </p>
                      <p className="text-xs text-neutral-600">
                        Receive important updates via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationData.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationData({
                          ...notificationData,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Push Notifications
                      </p>
                      <p className="text-xs text-neutral-600">
                        Get instant notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notificationData.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationData({
                          ...notificationData,
                          pushNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Weekly Digest</p>
                      <p className="text-xs text-neutral-600">
                        Summary of your weekly activity
                      </p>
                    </div>
                    <Switch
                      checked={notificationData.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotificationData({
                          ...notificationData,
                          weeklyDigest: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Product Updates
                      </p>
                      <p className="text-xs text-neutral-600">
                        News about new features and improvements
                      </p>
                    </div>
                    <Switch
                      checked={notificationData.productUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationData({
                          ...notificationData,
                          productUpdates: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <FormSection
                title="Security Settings"
                description="Manage your password and security preferences"
                icon={Lock}
              >
                <FormField
                  label="Current Password"
                  error={errors.currentPassword}
                >
                  <Input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>

                <FormField label="New Password" error={errors.newPassword}>
                  <Input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, newPassword: e.target.value })
                    }
                    placeholder="Enter new password"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>

                <FormField
                  label="Confirm New Password"
                  error={errors.confirmPassword}
                >
                  <Input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>

                <div className="pt-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-neutral-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={securityData.twoFactor}
                      onCheckedChange={(checked) =>
                        setSecurityData({ ...securityData, twoFactor: checked })
                      }
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
