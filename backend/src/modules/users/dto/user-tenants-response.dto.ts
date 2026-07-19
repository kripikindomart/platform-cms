/**
 * User Tenants Response DTO
 * Returns list of tenants that user has access to
 */

export class TenantAccessDto {
  id!: number;
  slug!: string;
  name!: string;
  logo_url!: string | null;
  is_active!: boolean;
  
  // User's role in this tenant
  role_name!: string;
  role_display_name!: string;
  
  // Metadata
  user_role_assigned_at!: Date;
}

export class UserTenantsResponseDto {
  user_id!: number;
  user_email!: string;
  tenants!: TenantAccessDto[];
  default_tenant!: string | null; // Suggested default tenant slug
}
