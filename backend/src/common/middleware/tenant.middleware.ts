import { Injectable, NestMiddleware, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from '../context/tenant-context.service';
import { TenantsRepository } from '../../modules/tenants/tenants.repository';

/**
 * Tenant Detection Middleware
 * 
 * Automatically detects tenant dari HTTP request dan sets tenant context.
 * 
 * Detection Strategy (priority order):
 * 1. X-Tenant-Slug custom header (untuk API clients, testing)
 * 2. Subdomain extraction (untuk multi-tenant SaaS)
 * 3. Fallback to default tenant dari ENV
 * 
 * @example
 * // Header-based detection
 * curl -H "X-Tenant-Slug: acme" http://localhost:3000/api/categories
 * 
 * // Subdomain-based detection
 * curl http://acme.platform-cms.com/api/categories
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly tenantsRepository: TenantsRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract tenant identifier dari request
      const tenantSlug = this.extractTenantSlug(req);

      if (!tenantSlug) {
        throw new BadRequestException(
          'Tenant tidak terdeteksi. Gunakan header X-Tenant-Slug atau subdomain yang valid.'
        );
      }

      // 2. Validate slug format (alphanumeric, dash, underscore only)
      if (!/^[a-z0-9_-]+$/i.test(tenantSlug)) {
        throw new BadRequestException(
          `Tenant slug tidak valid: "${tenantSlug}". Hanya alphanumeric, dash, dan underscore diperbolehkan.`
        );
      }

      // 3. Load tenant dari database
      const tenant = await this.tenantsRepository.findBySlug(tenantSlug);

      if (!tenant) {
        throw new NotFoundException(
          `Tenant "${tenantSlug}" tidak ditemukan. Pastikan tenant sudah terdaftar di sistem.`
        );
      }

      // 4. Validate tenant is active
      if (!tenant.is_active) {
        throw new ForbiddenException(
          `Tenant "${tenantSlug}" tidak aktif. Hubungi administrator untuk mengaktifkan tenant.`
        );
      }

      // 5. Set tenant context untuk request ini
      this.tenantContext.setTenant({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        schemaName: tenant.schema_name,
        config: tenant.config ? JSON.parse(tenant.config) : undefined,
      });

      // Log untuk debugging (optional, bisa di-disable di production)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[TenantMiddleware] Tenant detected: ${tenant.slug} (schema: ${tenant.schema_name})`);
      }

      next();
    } catch (error) {
      // Pass error ke global exception handler
      next(error);
    }
  }

  /**
   * Extract tenant slug dari request
   * Priority: header > subdomain > fallback
   */
  private extractTenantSlug(req: Request): string | null {
    // Priority 1: Check X-Tenant-Slug header
    const headerSlug = req.headers['x-tenant-slug'] as string;
    if (headerSlug) {
      return headerSlug.toLowerCase().trim();
    }

    // Priority 2: Extract dari subdomain
    const host = req.hostname || req.headers.host?.split(':')[0];
    if (host) {
      const subdomainSlug = this.extractSubdomain(host);
      if (subdomainSlug) {
        return subdomainSlug;
      }
    }

    // Priority 3: Fallback to default tenant dari ENV
    const defaultTenant = process.env.DEFAULT_TENANT_SLUG;
    if (defaultTenant) {
      return defaultTenant.toLowerCase().trim();
    }

    return null;
  }

  /**
   * Extract subdomain dari hostname
   * 
   * @example
   * extractSubdomain('acme.platform-cms.com') => 'acme'
   * extractSubdomain('localhost') => null
   * extractSubdomain('platform-cms.com') => null
   * extractSubdomain('beta.acme.platform-cms.com') => 'beta.acme'
   */
  private extractSubdomain(hostname: string): string | null {
    // Ignore localhost dan IP addresses
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return null;
    }

    const parts = hostname.split('.');
    
    // Minimal 3 parts untuk subdomain (subdomain.domain.tld)
    if (parts.length < 3) {
      return null;
    }

    // Get base domain dari ENV (e.g., 'platform-cms.com')
    const baseDomain = process.env.BASE_DOMAIN || 'platform-cms.com';
    const baseParts = baseDomain.split('.');

    // Extract subdomain parts (semua kecuali base domain)
    const subdomainParts = parts.slice(0, parts.length - baseParts.length);
    
    if (subdomainParts.length === 0) {
      return null;
    }

    return subdomainParts.join('.');
  }
}

