// Common API response types

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  is_verified: boolean;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  role_ids?: number[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  role_ids?: number[];
}

// Role types
export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_system: boolean;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface CreateRoleDTO {
  name: string;
  slug: string;
  description?: string;
  permission_ids?: number[];
}

export interface UpdateRoleDTO {
  name?: string;
  slug?: string;
  description?: string;
  permission_ids?: number[];
}

// Permission types
export interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    name: string;
    is_verified: boolean;
  };
}

// Tenant types
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantDTO {
  name: string;
  slug: string;
  domain?: string;
}

export interface UpdateTenantDTO {
  name?: string;
  slug?: string;
  domain?: string;
  is_active?: boolean;
}

// Audit log types
export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id?: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

export interface QueryAuditLogsDTO {
  user_id?: number;
  action?: string;
  resource?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}
