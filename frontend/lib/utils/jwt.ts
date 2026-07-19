/**
 * Decode JWT token without verification (client-side only)
 * Use this as fallback when API call fails
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Get JWT token from cookie
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const name = 'token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  
  return null;
}

/**
 * Get current user ID from JWT token (fallback method)
 */
export function getCurrentUserIdFromToken(): number | null {
  const token = getTokenFromCookie();
  if (!token) return null;
  
  const payload = decodeJWT(token);
  if (!payload || !payload.sub) return null;
  
  return payload.sub;
}
