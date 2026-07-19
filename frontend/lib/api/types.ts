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
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  must_change_password: boolean;
  password_changed_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
  deleted_at?: string | null;
  deleted_by?: number | null;
  roles?: Role[];
  tenants?: TenantAssignment[];
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
  display_name: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  deleted_at?: string;
  deleted_by?: number;
  permissions?: Permission[];
}

export interface CreateRoleDTO {
  name: string;
  display_name: string;
  description?: string;
  permission_ids?: number[];
}

export interface UpdateRoleDTO {
  name?: string;
  display_name?: string;
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

// Tenant Assignment types
export interface TenantAssignment {
  id: number;
  slug: string;
  name: string;
  logo_url?: string | null;
  is_active: boolean;
  role_name: string;
  role_display_name: string;
  user_role_assigned_at: string;
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
  redirect?: {
    shouldAutoRedirect: boolean;
    tenantId: number | null;
    tenantSlug: string | null;
  };
}

export interface UserPreferences {
  id: number;
  user_id: number;
  is_single_tenant_mode: boolean;
  default_tenant_id: number | null;
  skip_org_selection: boolean;
  show_org_switcher: boolean;
  theme: string;
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_settings?: any;
  additional_settings?: any;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserPreferencesDTO {
  is_single_tenant_mode?: boolean;
  default_tenant_id?: number | null;
  skip_org_selection?: boolean;
  show_org_switcher?: boolean;
  theme?: string;
  language?: string;
  timezone?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  notification_settings?: any;
  additional_settings?: any;
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
