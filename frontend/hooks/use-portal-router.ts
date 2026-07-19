'use client';

import { usePathname, useRouter } from 'next/navigation';
import { getTenantSlug, portalUrl } from '@/lib/utils/route-helper';

/**
 * Hook for tenant-aware portal routing
 * Automatically includes tenant slug in all portal URLs
 */
export function usePortalRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const tenantSlug = getTenantSlug(pathname);

  /**
   * Navigate to a portal route with tenant
   * @param path - Portal path (e.g., "/users" or "users/123")
   */
  const push = (path: string) => {
    const url = portalUrl(path, tenantSlug);
    router.push(url);
  };

  /**
   * Replace current route with portal route
   * @param path - Portal path
   */
  const replace = (path: string) => {
    const url = portalUrl(path, tenantSlug);
    router.replace(url);
  };

  /**
   * Generate portal URL without navigating
   * @param path - Portal path
   * @returns Full URL with tenant
   */
  const url = (path: string) => {
    return portalUrl(path, tenantSlug);
  };

  return {
    push,
    replace,
    url,
    tenantSlug,
    // Also expose original router for non-portal routes
    router,
  };
}
