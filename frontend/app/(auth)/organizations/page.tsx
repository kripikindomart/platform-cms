'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, ChevronRight, Loader2, LogOut } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authService } from '@/lib/api/services/auth.service';
import { toast } from 'sonner';

interface TenantAccess {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  role_name: string;
  role_display_name: string;
  user_role_assigned_at: string;
}

interface UserTenantsResponse {
  user_id: number;
  user_email: string;
  tenants: TenantAccess[];
  default_tenant: string | null;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [tenants, setTenants] = useState<TenantAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<UserTenantsResponse>('/users/my-tenants');
      setTenants(response.tenants);
      
      // Auto-redirect if only one tenant
      if (response.tenants.length === 1) {
        const tenant = response.tenants[0];
        setTimeout(() => {
          router.push(`/org/${tenant.slug}/dashboard`);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTenant = (slug: string) => {
    // Save selected tenant to cookie/localStorage
    document.cookie = `selected-tenant=${slug}; path=/; max-age=31536000`; // 1 year
    localStorage.setItem('selected-tenant', slug);
    
    // Redirect to tenant dashboard
    router.push(`/org/${slug}/dashboard`);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authService.logout();
      logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Error Loading Organizations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadTenants}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            No Organizations Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You don't have access to any organizations yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logout Button */}
        <div className="text-center mb-12">
          {/* Logout Button - Top Right */}
          <div className="absolute top-6 right-6">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg"
          >
            <Building2 className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-slate-900 dark:text-white mb-3"
          >
            Choose an Organization
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            Select the organization you want to work with
          </motion.p>
        </div>

        {/* Organizations Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {tenants.map((tenant, index) => (
            <motion.button
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectTenant(tenant.slug)}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 text-left"
            >
              {/* Logo or Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {tenant.logo_url ? (
                    <img
                      src={tenant.logo_url}
                      alt={tenant.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tenant.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {tenant.role_display_name}
                    </p>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium">
                  {tenant.role_name}
                </span>
                {tenant.is_active ? (
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full mr-1.5"></span>
                    Inactive
                  </span>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>
          ))}
        </div>

        {/* Info Box */}
        {tenants.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center"
          >
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Redirecting to your organization...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
