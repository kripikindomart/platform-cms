import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';

/**
 * Hook to extract and manage tenant slug from URL
 * Supports both /org/{tenant}/... and /portal (legacy) routes
 */
export function useTenant() {
  const pathname = usePathname();

  const tenantSlug = useMemo(() => {
    // Check if URL is /org/{tenant}/...
    const orgMatch = pathname.match(/^\/org\/([^\/]+)/);
    if (orgMatch) {
      return orgMatch[1];
    }

    // Fallback: check cookie/localStorage
    if (typeof window !== 'undefined') {
      const cookieTenant = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('selected-tenant='))
        ?.split('=')[1];
      
      if (cookieTenant) {
        return cookieTenant;
      }

      const storedTenant = localStorage.getItem('selected-tenant');
      if (storedTenant) {
        return storedTenant;
      }
    }

    // Default fallback
    return 'demo_company';
  }, [pathname]);

  // Update API client tenant whenever it changes
  useEffect(() => {
    if (tenantSlug) {
      apiClient.setTenantSlug(tenantSlug);
      
      // Save to cookie & localStorage
      if (typeof window !== 'undefined') {
        document.cookie = `selected-tenant=${tenantSlug}; path=/; max-age=31536000`;
        localStorage.setItem('selected-tenant', tenantSlug);
      }
    }
  }, [tenantSlug]);

  return {
    tenantSlug,
    isOrgRoute: pathname.startsWith('/org/'),
  };
}
