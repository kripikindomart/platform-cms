'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Calendar, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';

interface TenantInfo {
  id: number;
  name: string;
  slug: string;
  schema_name: string;
  domain: string | null;
  is_active: boolean;
  created_at: string;
  config: {
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    timezone?: string;
  };
}

export default function TenantInfoPage() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantInfo();
  }, []);

  const fetchTenantInfo = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ tenant: TenantInfo }>('/tenants/current');
      setTenant(response.tenant);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
        <div className="text-red-600 font-semibold mb-2">Failed to load tenant information</div>
        <p className="text-sm text-neutral-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Organization Info</h1>
            <p className="text-neutral-600 mt-0.5">View your organization details</p>
          </div>
        </div>
        <Badge variant={tenant.is_active ? 'default' : 'secondary'} className="text-sm px-3 py-1">
          {tenant.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </motion.div>

      {/* Organization Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{tenant.name}</h2>
              <p className="text-blue-100 mt-1">/{tenant.slug}</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 mb-1">Organization Name</p>
                  <p className="text-sm font-semibold text-neutral-900 truncate">{tenant.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 mb-1">Slug</p>
                  <p className="text-sm font-semibold text-neutral-900 font-mono truncate">
                    {tenant.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 mb-1">Created At</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {new Date(tenant.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {tenant.domain && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500 mb-1">Domain</p>
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {tenant.domain}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          {(tenant.config?.contact_email ||
            tenant.config?.contact_phone ||
            tenant.config?.address) && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenant.config.contact_email && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-500 mb-1">Email</p>
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {tenant.config.contact_email}
                      </p>
                    </div>
                  </div>
                )}

                {tenant.config.contact_phone && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-500 mb-1">Phone</p>
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {tenant.config.contact_phone}
                      </p>
                    </div>
                  </div>
                )}

                {tenant.config.address && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 md:col-span-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-500 mb-1">Address</p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {tenant.config.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Info */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Technical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 mb-1">Schema Name</p>
                  <p className="text-sm font-semibold text-neutral-900 font-mono truncate">
                    {tenant.schema_name}
                  </p>
                </div>
              </div>

              {tenant.config?.timezone && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500 mb-1">Timezone</p>
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {tenant.config.timezone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
