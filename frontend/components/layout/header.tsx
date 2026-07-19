'use client';

import { Bell, Search, Command, LogOut, User, Settings, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authService } from '@/lib/api/services/auth.service';
import { userPreferencesService } from '@/lib/api/services/user-preferences.service';
import type { UserPreferences } from '@/lib/api/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { usePortalRouter } from '@/hooks/use-portal-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TenantAccess {
  id: number;
  slug: string;
  name: string;
  role_name: string;
  role_display_name: string;
}

export function Header() {
  const router = useRouter();
  const { push } = usePortalRouter();
  const { user, logout } = useAuthStore();
  const { tenantSlug } = useTenant();
  const [tenants, setTenants] = useState<TenantAccess[]>([]);
  const [currentTenant, setCurrentTenant] = useState<TenantAccess | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    loadTenants();
    loadPreferences();
  }, [tenantSlug]);

  const loadPreferences = async () => {
    try {
      const prefs = await userPreferencesService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await apiClient.get<{ tenants: TenantAccess[] }>('/users/my-tenants');
      setTenants(response.tenants || []);
      
      // Find current tenant
      const current = response.tenants.find((t: TenantAccess) => t.slug === tenantSlug);
      setCurrentTenant(current || null);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const handleSwitchTenant = (slug: string) => {
    // Skip if already on this tenant
    if (slug === tenantSlug) {
      return;
    }
    
    // Save to storage FIRST
    document.cookie = `selected-tenant=${slug}; path=/; max-age=31536000`;
    localStorage.setItem('selected-tenant', slug);
    
    // Force hard navigation with full page reload
    // Using window.location.replace to ensure browser doesn't cache
    const targetUrl = `/org/${slug}/portal`;
    
    // Add cache busting to force reload
    const url = new URL(targetUrl, window.location.origin);
    url.searchParams.set('_t', Date.now().toString());
    
    // Use replace to avoid back button issues
    window.location.replace(url.toString());
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if API fails, still logout client side
      logout();
    }
  };

  return (
    <header className="h-16 border-b border-neutral-100 bg-white/80 backdrop-blur-xl fixed top-0 right-0 left-[280px] z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <button className="w-full max-w-md group">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-all duration-200">
              <Search className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-500 flex-1 text-left">Search or jump to...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-neutral-200 text-xs font-medium text-neutral-500">
                <Command className="h-3 w-3" />
                <span>K</span>
              </kbd>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Tenant Switcher - Only show if enabled in preferences */}
          {currentTenant && preferences?.show_org_switcher && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-neutral-100 transition-all cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs text-neutral-500 leading-none">Organization</span>
                    <span className="text-sm font-semibold text-neutral-900 leading-tight mt-0.5">
                      {currentTenant.name}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-xl rounded-xl p-0 overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Switch Organization
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {tenants.map((tenant) => (
                      <DropdownMenuItem
                        key={tenant.id}
                        onClick={() => handleSwitchTenant(tenant.slug)}
                        className={`mx-2 my-0.5 rounded-lg cursor-pointer transition-all ${
                          tenant.slug === tenantSlug 
                            ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' 
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full py-2 px-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-neutral-900 truncate">
                              {tenant.name}
                            </div>
                            <div className="text-xs text-neutral-500 truncate">
                              {tenant.role_display_name}
                            </div>
                          </div>
                          {tenant.slug === tenantSlug && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 ring-2 ring-blue-100" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <div className="bg-neutral-50 p-2 border-t border-neutral-200">
                    <DropdownMenuItem 
                      onClick={() => router.push('/organizations')} 
                      className="rounded-lg hover:bg-white cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2 w-full py-1">
                        <Building2 className="h-4 w-4 text-neutral-600" />
                        <span className="text-sm font-medium text-neutral-700">Manage Organizations</span>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Divider */}
              <div className="w-px h-6 bg-neutral-200 mx-2" />
            </>
          )}

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon"
            className="relative h-10 w-10 rounded-xl hover:bg-neutral-100"
          >
            <Bell className="h-5 w-5 text-neutral-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-200 mx-2" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-xl transition-all">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-neutral-900">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-neutral-500">{user?.email}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
