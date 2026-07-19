/**
 * Route Helper Utilities
 * Helps generate tenant-aware URLs
 */

/**
 * Get current tenant slug from pathname
 * @param pathname - Current pathname (e.g., /org/acme/portal/users)
 * @returns Tenant slug (e.g., "acme") or empty string
 */
export function getTenantSlug(pathname: string): string {
  const parts = pathname.split('/');
  // Pattern: /org/[tenant]/...
  if (parts[1] === 'org' && parts[2]) {
    return parts[2];
  }
  return '';
}

/**
 * Generate tenant-aware portal URL
 * @param path - Portal path (e.g., "/users" or "users")
 * @param tenant - Tenant slug (optional, will extract from window if not provided)
 * @returns Full URL with tenant (e.g., "/org/acme/portal/users")
 */
export function portalUrl(path: string, tenant?: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get tenant from parameter or window location
  let tenantSlug = tenant;
  if (!tenantSlug && typeof window !== 'undefined') {
    tenantSlug = getTenantSlug(window.location.pathname);
  }
  
  if (!tenantSlug) {
    console.warn('[portalUrl] No tenant slug found, returning path as-is');
    return `/${cleanPath}`;
  }
  
  // Handle portal prefix
  const finalPath = cleanPath.startsWith('portal/') 
    ? cleanPath 
    : `portal/${cleanPath}`;
  
  return `/org/${tenantSlug}/${finalPath}`;
}
