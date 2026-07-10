import { Injectable, Scope } from '@nestjs/common';
import { TenantContext } from '../interfaces/tenant.interface';

/**
 * Tenant Context Service
 * REQUEST-scoped service untuk manage tenant context per request
 *
 * IMPORTANT: Service ini MUST be REQUEST-scoped untuk ensure
 * tenant isolation antar requests
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenant: TenantContext | null = null;

  /**
   * Set tenant context untuk current request
   */
  setTenant(tenant: TenantContext): void {
    this.tenant = tenant;
  }

  /**
   * Get current tenant context
   * @throws Error jika tenant belum di-set
   */
  getTenant(): TenantContext {
    if (!this.tenant) {
      throw new Error(
        'Tenant context not set. ' +
          'Make sure tenant middleware is applied to this route, ' +
          'or set tenant context manually using setTenant().',
      );
    }
    return this.tenant;
  }

  /**
   * Check if tenant context sudah di-set
   */
  hasTenant(): boolean {
    return this.tenant !== null;
  }

  /**
   * Get tenant schema name
   * @throws Error jika tenant belum di-set
   */
  getSchemaName(): string {
    return this.getTenant().schemaName;
  }

  /**
   * Get tenant ID
   * @throws Error jika tenant belum di-set
   */
  getTenantId(): number {
    return this.getTenant().id;
  }

  /**
   * Get tenant slug
   * @throws Error jika tenant belum di-set
   */
  getTenantSlug(): string {
    return this.getTenant().slug;
  }

  /**
   * Get tenant name
   * @throws Error jika tenant belum di-set
   */
  getTenantName(): string {
    return this.getTenant().name;
  }

  /**
   * Get tenant config (jika ada)
   * @throws Error jika tenant belum di-set
   */
  getTenantConfig(): TenantContext['config'] {
    return this.getTenant().config;
  }

  /**
   * Clear tenant context
   * Useful untuk cleanup atau testing
   */
  clear(): void {
    this.tenant = null;
  }
}
