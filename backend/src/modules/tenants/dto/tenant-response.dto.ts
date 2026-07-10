import { Tenant } from '../../../database/schema/public';

/**
 * Tenant Response DTO
 * Format response untuk tenant data
 */
export class TenantResponseDto {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  schemaName: string;
  subscriptionTier: string;
  subscriptionExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(tenant: Tenant) {
    this.id = tenant.id;
    this.name = tenant.name;
    this.slug = tenant.slug;
    this.domain = tenant.domain ?? undefined;
    this.schemaName = tenant.schema_name;
    this.subscriptionTier = tenant.subscription_tier;
    this.subscriptionExpiresAt = tenant.subscription_expires_at ?? undefined;
    this.isActive = tenant.is_active;
    this.createdAt = tenant.created_at;
    this.updatedAt = tenant.updated_at;
  }
}
