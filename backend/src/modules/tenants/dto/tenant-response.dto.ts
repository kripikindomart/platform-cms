import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for tenant
 */
export class TenantResponseDto {
  @ApiProperty({ description: 'Tenant ID' })
  id!: number;

  @ApiProperty({ description: 'Tenant name' })
  name!: string;

  @ApiProperty({ description: 'Tenant slug' })
  slug!: string;

  @ApiProperty({ description: 'Schema name' })
  schema_name!: string;

  @ApiProperty({ description: 'Tenant domain', required: false })
  domain?: string | null;

  @ApiProperty({ description: 'Logo URL', required: false })
  logo_url?: string | null;

  @ApiProperty({ description: 'Primary brand color', required: false })
  primary_color?: string | null;

  @ApiProperty({ description: 'Secondary brand color', required: false })
  secondary_color?: string | null;

  @ApiProperty({ description: 'Subscription tier', required: false })
  subscription_tier?: string | null;

  @ApiProperty({ description: 'Is tenant active' })
  is_active!: boolean;

  @ApiProperty({ description: 'Tenant configuration (JSON)', required: false })
  config?: Record<string, any> | null;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at!: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;

  @ApiProperty({ description: 'Created by user ID', required: false })
  created_by?: number | null;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  updated_by?: number | null;

  constructor(tenant: any) {
    this.id = tenant.id;
    this.name = tenant.name;
    this.slug = tenant.slug;
    this.schema_name = tenant.schema_name;
    this.domain = tenant.domain;
    this.logo_url = tenant.logo_url;
    this.primary_color = tenant.primary_color;
    this.secondary_color = tenant.secondary_color;
    this.subscription_tier = tenant.subscription_tier;
    this.is_active = tenant.is_active;
    
    // Parse config if it's a string
    if (typeof tenant.config === 'string') {
      try {
        this.config = JSON.parse(tenant.config);
      } catch {
        this.config = null;
      }
    } else {
      this.config = tenant.config;
    }
    
    this.created_at = tenant.created_at;
    this.updated_at = tenant.updated_at;
    this.deleted_at = tenant.deleted_at;
    this.created_by = tenant.created_by;
    this.updated_by = tenant.updated_by;
  }
}
