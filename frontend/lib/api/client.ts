import { env } from '@/config/env';
import { portalUrl } from '@/lib/utils/route-helper';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, unknown>;
}

class ApiClient {
  private baseURL: string;
  private tenantSlug: string;

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL;
    this.tenantSlug = env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG;
  }

  setTenantSlug(slug: string) {
    this.tenantSlug = slug;
  }

  private getHeaders(customHeaders?: HeadersInit, skipTenant = false): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add custom headers
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    // Add tenant header if available and not skipped
    if (this.tenantSlug && !skipTenant) {
      headers['X-Tenant-Slug'] = this.tenantSlug;
    }

    // Add authorization header from cookie if available
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private buildURL(endpoint: string, params?: Record<string, unknown>): string {
    // Remove leading slash from endpoint if exists
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Ensure baseURL ends with / for proper concatenation
    const baseWithSlash = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    
    // Concatenate manually to avoid URL() path replacement issue
    const fullPath = baseWithSlash + cleanEndpoint;
    const url = new URL(fullPath);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
        code: 'UNKNOWN_ERROR',
      }));

      if (typeof window !== 'undefined') {
        if (response.status === 401) {
          // Not authenticated (missing/expired token) - clear session and go to login.
          document.cookie = 'token=; path=/; max-age=0';
          window.location.href = '/login';
        } else if (response.status === 403) {
          // Authenticated but not permitted for this resource - back to the tenant dashboard.
          window.location.href = portalUrl('dashboard');
        }
      }

      throw new ApiError(
        error.message || 'Request failed',
        response.status,
        error.code
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    
    // Skip tenant header for auth endpoints and user profile
    const skipTenant = endpoint.includes('/auth/') || 
                      endpoint.includes('/users/my-tenants') ||
                      endpoint.includes('/users/me');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(config?.headers, skipTenant),
      credentials: 'include', // Include cookies
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    
    // Skip tenant header for auth endpoints
    const skipTenant = endpoint.includes('/auth/') || endpoint.includes('/users/my-tenants');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(config?.headers, skipTenant),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    
    // Skip tenant header for user preferences
    const skipTenant = endpoint.includes('/users/me');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(config?.headers, skipTenant),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(config?.headers),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(config?.headers),
      credentials: 'include',
      ...config,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
