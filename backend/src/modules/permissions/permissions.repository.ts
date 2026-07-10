import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, inArray } from 'drizzle-orm';
import * as tenantSchema from '@/database/schema/tenant';
import { TenantContextService } from '@/common/context/tenant-context.service';

export interface Permission {
  id: number;
  resource: string;
  action: string;
  scope: string;
  description: string | null;
  created_at: Date;
}

/**
 * Permission with computed slug
 */
export interface PermissionWithSlug extends Permission {
  slug: string;
  name: string;
}

@Injectable()
export class PermissionsRepository {
  constructor(
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<typeof tenantSchema>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Execute query in tenant schema context
   */
  private async withTenantSchema<T>(callback: () => Promise<T>): Promise<T> {
    const schemaName = this.tenantContext.getSchemaName();
    await this.db.execute(`SET search_path TO ${schemaName}, public`);
    try {
      return await callback();
    } finally {
      await this.db.execute('SET search_path TO public');
    }
  }

  /**
   * Add computed slug and name to permission
   */
  private enrichPermission(perm: Permission): PermissionWithSlug {
    return {
      ...perm,
      slug: `${perm.resource}.${perm.action}`,
      name: `${perm.resource}.${perm.action}`,
    };
  }

  async findBySlug(slug: string): Promise<PermissionWithSlug | null> {
    const [resource, action] = slug.split('.');
    
    if (!resource || !action) {
      return null;
    }

    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(tenantSchema.permissions)
        .where(and(eq(tenantSchema.permissions.resource, resource), eq(tenantSchema.permissions.action, action)))
        .limit(1);

      return results[0] ? this.enrichPermission(results[0] as Permission) : null;
    });
  }

  async findByResource(resource: string): Promise<PermissionWithSlug[]> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(tenantSchema.permissions)
        .where(eq(tenantSchema.permissions.resource, resource));

      return results.map((r) => this.enrichPermission(r as Permission));
    });
  }

  async findByIds(ids: number[]): Promise<PermissionWithSlug[]> {
    if (ids.length === 0) return [];

    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(tenantSchema.permissions)
        .where(inArray(tenantSchema.permissions.id, ids));

      return results.map((r) => this.enrichPermission(r as Permission));
    });
  }

  async findAll(): Promise<PermissionWithSlug[]> {
    return this.withTenantSchema(async () => {
      const results = await this.db.select().from(tenantSchema.permissions);

      return results.map((r) => this.enrichPermission(r as Permission));
    });
  }

  async findById(id: number): Promise<PermissionWithSlug | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db.select().from(tenantSchema.permissions).where(eq(tenantSchema.permissions.id, id)).limit(1);

      return results[0] ? this.enrichPermission(results[0] as Permission) : null;
    });
  }

  /**
   * Get all permissions for a user (through roles)
   */
  async getUserPermissions(userId: number): Promise<PermissionWithSlug[]> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select({
          permission: tenantSchema.permissions,
        })
        .from(tenantSchema.userRoles)
        .innerJoin(tenantSchema.rolePermissions, eq(tenantSchema.userRoles.role_id, tenantSchema.rolePermissions.role_id))
        .innerJoin(tenantSchema.permissions, eq(tenantSchema.rolePermissions.permission_id, tenantSchema.permissions.id))
        .where(eq(tenantSchema.userRoles.user_id, userId));

      return results.map((r) => this.enrichPermission(r.permission as Permission));
    });
  }

  /**
   * Check if permission slug is valid format: {resource}.{action}
   */
  isValidPermissionFormat(slug: string): boolean {
    const parts = slug.split('.');
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }
}
