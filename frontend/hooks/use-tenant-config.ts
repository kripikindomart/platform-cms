'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getTenantSlug } from '@/lib/utils/route-helper';
import { apiClient } from '@/lib/api/client';

export interface TenantConfig {
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  initials: string;
}

/**
 * Hook to get tenant configuration
 * Fetches from API endpoint /tenants/by-slug/:slug
 */
export function useTenantConfig() {
  const pathname = usePathname();
  const tenantSlug = getTenantSlug(pathname);
  
  const [config, setConfig] = useState<TenantConfig>({
    slug: tenantSlug,
    name: 'Platform CMS',
    logo_url: null,
    primary_color: null,
    initials: 'P',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) {
      // Generate fallback config first
      const initials = tenantSlug
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');

      const fallbackName = tenantSlug
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Set fallback first
      setConfig({
        slug: tenantSlug,
        name: fallbackName || 'Platform CMS',
        logo_url: null,
        primary_color: null,
        initials: initials || 'P',
      });

      // Fetch actual tenant data from API
      fetchTenantData(tenantSlug);
    }
  }, [tenantSlug]);

  const fetchTenantData = async (slug: string) => {
    try {
      setLoading(true);
      const data = await apiClient.get<any>(`/tenants/by-slug/${slug}`);
      
      // Generate initials from tenant name
      const tenantInitials = data.name
        .split(' ')
        .map((word: string) => word.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

      setConfig({
        slug: data.slug,
        name: data.name,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        initials: tenantInitials || 'P',
      });
      setError(null);
    } catch (err: any) {
      console.error('Failed to load tenant config:', err);
      setError(err?.message || 'Failed to load tenant information');
      // Keep fallback config
    } finally {
      setLoading(false);
    }
  };

  return { ...config, loading, error };
}
