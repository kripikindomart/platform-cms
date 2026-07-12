import { env } from '@/config/env';

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
  private tenantSlug?: string;

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL;
  }

  setTenantSlug(slug: string) {
    this.tenantSlug = slug;
  }

  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
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

    // Add tenant header if available
    if (this.tenantSlug) {
      headers['X-Tenant-Slug'] = this.tenantSlug;
    }

    return headers;
  }

  private buildURL(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(endpoint, this.baseURL);
    
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
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(config?.headers),
      credentials: 'include', // Include cookies
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(config?.headers),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(config?.headers),
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
