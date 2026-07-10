/**
 * Tenant Context Interface
 * Used for tenant information dalam request context
 */
export interface TenantContext {
  id: number;
  name: string;
  slug: string;
  schemaName: string;
  config?: TenantConfig;
}

/**
 * Tenant Configuration Interface
 * Structure untuk tenant-specific configuration
 */
export interface TenantConfig {
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    maxUsers?: number;
    maxStorage?: number;
    enabledFeatures?: string[];
  };
  limits?: {
    apiRateLimit?: number;
    storageLimit?: number;
  };
}

/**
 * Full Tenant Information Interface
 * Extended tenant info dengan semua fields dari database
 */
export interface TenantInfo extends TenantContext {
  domain?: string;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
