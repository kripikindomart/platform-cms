'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Building2,
  Eye,
  EyeOff,
  Globe,
  Bell,
  Moon,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { userPreferencesService } from '@/lib/api/services/user-preferences.service';
import { toast } from 'sonner';
import type { UserPreferences, UpdateUserPreferencesDTO } from '@/lib/api/types';

interface TenantAccess {
  id: number;
  slug: string;
  name: string;
  role_name: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
}

export default function UserPreferencesPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [tenants, setTenants] = useState<TenantAccess[]>([]);

  const [formData, setFormData] = useState<UpdateUserPreferencesDTO>({
    is_single_tenant_mode: false,
    default_tenant_id: null,
    skip_org_selection: false,
    show_org_switcher: true,
    theme: 'light',
    language: 'id',
    timezone: 'Asia/Jakarta',
    email_notifications: true,
    push_notifications: true,
  });

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user data, preferences, and tenants in parallel
      const [userData, prefsData, tenantsData] = await Promise.all([
        apiClient.get<User>(`/users/${userId}`),
        userPreferencesService.getUserPreferences(parseInt(userId)).catch(() => null),
        apiClient.get<{ tenants: TenantAccess[] }>(`/users/${userId}/tenants`),
      ]);

      setUser(userData);
      setTenants(tenantsData.tenants || []);

      if (prefsData) {
        setPreferences(prefsData);
        setFormData({
          is_single_tenant_mode: prefsData.is_single_tenant_mode,
          default_tenant_id: prefsData.default_tenant_id,
          skip_org_selection: prefsData.skip_org_selection,
          show_org_switcher: prefsData.show_org_switcher,
          theme: prefsData.theme,
          language: prefsData.language,
          timezone: prefsData.timezone,
          email_notifications: prefsData.email_notifications,
          push_notifications: prefsData.push_notifications,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate: if single-tenant mode is enabled, default_tenant_id is required
      if (formData.is_single_tenant_mode && !formData.default_tenant_id) {
        toast.error('Please select a default organization for single-tenant mode');
        return;
      }

      await userPreferencesService.updateUserPreferences(parseInt(userId), formData);
      
      toast.success('User preferences updated successfully');
      router.push(`/portal/users/${userId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleSingleTenantMode = (enabled: boolean) => {
    setFormData({
      ...formData,
      is_single_tenant_mode: enabled,
      skip_org_selection: enabled,
      show_org_switcher: !enabled,
      default_tenant_id: enabled && tenants.length === 1 ? tenants[0].id : formData.default_tenant_id,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading user preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-neutral-900">User Preferences</h1>
            <p className="text-neutral-600 mt-2">
              Configure settings for <span className="font-semibold">{user?.name}</span> ({user?.email})
            </p>
          </motion.div>
        </div>

        {/* Preferences Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Single Tenant Mode Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Single Tenant Mode</h2>
                  <p className="text-sm text-neutral-600">Auto-redirect user to a specific organization</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Enable Single Tenant Mode */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label className="text-base font-semibold text-neutral-900">Enable Single Tenant Mode</Label>
                  <p className="text-sm text-neutral-600 mt-1">
                    User will skip organization selection and go directly to their default organization
                  </p>
                </div>
                <button
                  onClick={() => toggleSingleTenantMode(!formData.is_single_tenant_mode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_single_tenant_mode ? 'bg-blue-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_single_tenant_mode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Default Organization Selector */}
              {formData.is_single_tenant_mode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <Label className="text-base font-semibold text-neutral-900">Default Organization</Label>
                  <div className="grid gap-3">
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.id}
                        onClick={() => setFormData({ ...formData, default_tenant_id: tenant.id })}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          formData.default_tenant_id === tenant.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-neutral-900">{tenant.name}</h3>
                          <p className="text-sm text-neutral-600">{tenant.role_name}</p>
                        </div>
                        {formData.default_tenant_id === tenant.id && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {tenants.length === 0 && (
                    <div className="p-6 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                      <Building2 className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600">User has no organization access</p>
                    </div>
                  )}

                  {/* Additional Options */}
                  <div className="pt-4 space-y-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <EyeOff className="w-5 h-5 text-neutral-600" />
                        <div>
                          <Label className="font-medium text-neutral-900">Hide Organization Switcher</Label>
                          <p className="text-sm text-neutral-600">Remove tenant switcher from header</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFormData({ ...formData, show_org_switcher: !formData.show_org_switcher })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          !formData.show_org_switcher ? 'bg-blue-600' : 'bg-neutral-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            !formData.show_org_switcher ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* UI Preferences Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">UI Preferences</h2>
                  <p className="text-sm text-neutral-600">Customize user interface settings</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Theme */}
              <div>
                <Label className="text-base font-semibold text-neutral-900">Theme</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setFormData({ ...formData, theme })}
                      className={`p-4 rounded-xl border-2 transition-all capitalize ${
                        formData.theme === theme
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <Label className="text-base font-semibold text-neutral-900">Language</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={() => setFormData({ ...formData, language: 'id' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.language === 'id'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    🇮🇩 Bahasa Indonesia
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, language: 'en' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.language === 'en'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Notifications</h2>
                  <p className="text-sm text-neutral-600">Control notification preferences</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-neutral-900">Email Notifications</Label>
                <button
                  onClick={() => setFormData({ ...formData, email_notifications: !formData.email_notifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.email_notifications ? 'bg-green-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.email_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-medium text-neutral-900">Push Notifications</Label>
                <button
                  onClick={() => setFormData({ ...formData, push_notifications: !formData.push_notifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.push_notifications ? 'bg-green-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.push_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
