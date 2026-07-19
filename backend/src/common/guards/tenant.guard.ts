import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException, BadRequestException, Scope } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TenantContextService } from '../context/tenant-context.service';
import { TenantsRepository } from '../../modules/tenants/tenants.repository';

/**
 * Tenant Guard
 * 
 * Runs BEFORE other guards to ensure tenant context is set
 * Always sets tenant context - no @Public() check here
 * (Public routes like /health still need tenant context for audit logging)
 * 
 * REQUEST-scoped because it depends on REQUEST-scoped TenantContextService
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
    private readonly tenantsRepository: TenantsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip tenant validation for specific routes
    const skipRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/users/my-tenants',
      '/api/users/me',
      '/api/users/me/preferences',
      '/api/upload', // Upload endpoints
      '/auth/login',
      '/auth/register',
      '/users/my-tenants',
      '/users/me',
      '/users/me/preferences'
    ];
    
    const shouldSkip = skipRoutes.some(route => 
      request.url === route || 
      request.path === route ||
      request.url.startsWith(route) || 
      request.path.startsWith(route)
    );

    if (shouldSkip) {
      console.log(`[TenantGuard] ✓ Skipping tenant validation for: ${request.url}`);
      return true;
    }

    // Extract tenant slug
    const tenantSlug = this.extractTenantSlug(request);

    if (!tenantSlug) {
      throw new BadRequestException(
        'Tenant tidak terdeteksi. Gunakan header X-Tenant-Slug atau subdomain yang valid.'
      );
    }

    // Validate slug format
    if (!/^[a-z0-9_-]+$/i.test(tenantSlug)) {
      throw new BadRequestException(
        `Tenant slug tidak valid: "${tenantSlug}". Hanya alphanumeric, dash, dan underscore diperbolehkan.`
      );
    }

    // Load tenant
    const tenant = await this.tenantsRepository.findBySlug(tenantSlug);

    if (!tenant) {
      throw new NotFoundException(
        `Tenant "${tenantSlug}" tidak ditemukan. Pastikan tenant sudah terdaftar di sistem.`
      );
    }

    // Validate active
    if (!tenant.is_active) {
      throw new ForbiddenException(
        `Tenant "${tenantSlug}" tidak aktif. Hubungi administrator untuk mengaktifkan tenant.`
      );
    }

    // Set tenant context
    this.tenantContext.setTenant({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      schemaName: tenant.schema_name,
      config: tenant.config ? JSON.parse(tenant.config) : undefined,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[TenantGuard] Tenant set: ${tenant.slug} (schema: ${tenant.schema_name})`);
    }

    return true;
  }

  private extractTenantSlug(req: Request): string | null {
    // Priority 1: Header
    const headerSlug = req.headers['x-tenant-slug'] as string;
    if (headerSlug) {
      return headerSlug.toLowerCase().trim();
    }

    // Priority 2: Subdomain
    const host = req.hostname || req.headers.host?.split(':')[0];
    if (host) {
      const subdomainSlug = this.extractSubdomain(host);
      if (subdomainSlug) {
        return subdomainSlug;
      }
    }

    // Priority 3: Default from ENV
    const defaultTenant = process.env.DEFAULT_TENANT_SLUG;
    if (defaultTenant) {
      return defaultTenant.toLowerCase().trim();
    }

    return null;
  }

  private extractSubdomain(hostname: string): string | null {
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return null;
    }

    const parts = hostname.split('.');
    if (parts.length < 3) {
      return null;
    }

    const baseDomain = process.env.BASE_DOMAIN || 'platform-cms.com';
    const baseParts = baseDomain.split('.');
    const subdomainParts = parts.slice(0, parts.length - baseParts.length);
    
    if (subdomainParts.length === 0) {
      return null;
    }

    return subdomainParts.join('.');
  }
}

