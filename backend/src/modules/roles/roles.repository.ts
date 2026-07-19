import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import * as tenantSchema from '@/database/schema/tenant';
import { BaseRepository } from '@/common/database/base.repository';
import { TenantContextService } from '@/common/context/tenant-context.service';

export interface Role {
  id: number;
  name: string; // This is the slug (e.g., "super_admin")
  display_name: string; // This is the human-readable name
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  permissions?: Array<{
    id: number;
    slug: string;
    name: string;
    resource: string;
    action: string;
    scope: string;
    description: string | null;
    created_at: Date;
  }>;
}

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(db, tenantSchema.roles as any, tenantContext);
  }

  /**
   * Find role by name (slug)
   */
  async findBySlug(slug: string): Promise<Role | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(tenantSchema.roles)
        .where(and(eq(tenantSchema.roles.name, slug), sql`${tenantSchema.roles.deleted_at} IS NULL`))
        .limit(1);

      return (results[0] as Role) || null;
    });
  }

  /**
   * Get role with its permissions
   */
  async findByIdWithPermissions(roleId: number): Promise<Role | null> {
    return this.withTenantSchema(async () => {
      // Get role
      const roleResults = await this.db
        .select()
        .from(tenantSchema.roles)
        .where(and(eq(tenantSchema.roles.id, roleId), sql`${tenantSchema.roles.deleted_at} IS NULL`))
        .limit(1);

      if (roleResults.length === 0) return null;

      const role = roleResults[0] as Role;

      // Get permissions with computed slug
      const permissionResults = await this.db
        .select({
          id: tenantSchema.permissions.id,
          resource: tenantSchema.permissions.resource,
          action: tenantSchema.permissions.action,
          scope: tenantSchema.permissions.scope,
          description: tenantSchema.permissions.description,
          created_at: tenantSchema.permissions.created_at,
        })
        .from(tenantSchema.rolePermissions)
        .innerJoin(tenantSchema.permissions, eq(tenantSchema.rolePermissions.permission_id, tenantSchema.permissions.id))
        .where(eq(tenantSchema.rolePermissions.role_id, roleId));

      // Add computed slug and name
      role.permissions = permissionResults.map((p) => ({
        ...p,
        slug: `${p.resource}.${p.action}`,
        name: `${p.resource}.${p.action}`,
      }));

      return role;
    });
  }

  /**
   * Get all roles with their permissions
   */
  async findAllWithPermissions(): Promise<Role[]> {
    return this.withTenantSchema(async () => {
      // Get all roles
      const roles = await this.db
        .select()
        .from(tenantSchema.roles)
        .where(sql`${tenantSchema.roles.deleted_at} IS NULL`);

      // Get permissions for each role
      for (const role of roles) {
        const permissionResults = await this.db
          .select({
            id: tenantSchema.permissions.id,
            resource: tenantSchema.permissions.resource,
            action: tenantSchema.permissions.action,
            scope: tenantSchema.permissions.scope,
            description: tenantSchema.permissions.description,
            created_at: tenantSchema.permissions.created_at,
          })
          .from(tenantSchema.rolePermissions)
          .innerJoin(tenantSchema.permissions, eq(tenantSchema.rolePermissions.permission_id, tenantSchema.permissions.id))
          .where(eq(tenantSchema.rolePermissions.role_id, role.id));

        // Add computed slug and name
        (role as Role).permissions = permissionResults.map((p) => ({
          ...p,
          slug: `${p.resource}.${p.action}`,
          name: `${p.resource}.${p.action}`,
        }));
      }

      return roles as Role[];
    });
  }

  /**
   * Assign permissions to role
   * Skips duplicates automatically
   */
  async assignPermissions(roleId: number, permissionIds: number[], userId: number): Promise<number> {
    return this.withTenantSchema(async () => {
      // Get existing permissions
      const existing = await this.db
        .select({ permission_id: tenantSchema.rolePermissions.permission_id })
        .from(tenantSchema.rolePermissions)
        .where(eq(tenantSchema.rolePermissions.role_id, roleId));

      const existingIds = new Set(existing.map((r) => r.permission_id));

      // Filter out duplicates
      const newPermissionIds = permissionIds.filter((id) => !existingIds.has(id));

      if (newPermissionIds.length === 0) {
        return 0; // No new permissions to assign
      }

      // Insert new role-permission mappings
      const values = newPermissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
        created_by: userId,
        created_at: new Date(),
      }));

      await this.db.insert(tenantSchema.rolePermissions).values(values);

      return newPermissionIds.length;
    });
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: number, permissionId: number): Promise<boolean> {
    return this.withTenantSchema(async () => {
      const result = await this.db
        .delete(tenantSchema.rolePermissions)
        .where(and(eq(tenantSchema.rolePermissions.role_id, roleId), eq(tenantSchema.rolePermissions.permission_id, permissionId)));

      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Remove all permissions from role
   */
  async removeAllPermissions(roleId: number): Promise<number> {
    return this.withTenantSchema(async () => {
      const result = await this.db.delete(tenantSchema.rolePermissions).where(eq(tenantSchema.rolePermissions.role_id, roleId));

      return result.rowCount || 0;
    });
  }

  /**
   * Assign roles to user
   */
  async assignRolesToUser(userId: number, roleIds: number[], assignedBy: number): Promise<number> {
    return this.withTenantSchema(async () => {
      // Get existing role assignments
      const existing = await this.db
        .select({ role_id: tenantSchema.userRoles.role_id })
        .from(tenantSchema.userRoles)
        .where(eq(tenantSchema.userRoles.user_id, userId));

      const existingIds = new Set(existing.map((r) => r.role_id));

      // Filter out duplicates
      const newRoleIds = roleIds.filter((id) => !existingIds.has(id));

      if (newRoleIds.length === 0) {
        return 0; // No new roles to assign
      }

      // Insert new user-role mappings
      const values = newRoleIds.map((roleId) => ({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
        assigned_at: new Date(),
      }));

      await this.db.insert(tenantSchema.userRoles).values(values);

      return newRoleIds.length;
    });
  }

  /**
   * Get user roles with permissions
   */
  async getUserRolesWithPermissions(userId: number): Promise<Role[]> {
    return this.withTenantSchema(async () => {
      const schemaName = this.tenantContext.getSchemaName();
      
      // Use raw SQL with explicit schema to avoid search_path issues
      const query = sql`
        SELECT 
          r.id, 
          r.name, 
          r.display_name, 
          r.description, 
          r.is_system, 
          r.is_active, 
          r.created_at, 
          r.updated_at, 
          r.created_by, 
          r.updated_by, 
          r.deleted_at, 
          r.deleted_by
        FROM ${sql.raw(`"${schemaName}".user_roles`)} ur
        INNER JOIN ${sql.raw(`"${schemaName}".roles`)} r ON ur.role_id = r.id
        WHERE ur.user_id = ${userId}
          AND r.deleted_at IS NULL
      `;
      
      const roleResults = await this.db.execute(query);
      const roles = roleResults.rows as unknown as Role[];

      // Get permissions for each role
      for (const role of roles) {
        const permQuery = sql`
          SELECT 
            p.id, 
            p.resource, 
            p.action, 
            p.scope, 
            p.description, 
            p.created_at
          FROM ${sql.raw(`"${schemaName}".role_permissions`)} rp
          INNER JOIN ${sql.raw(`"${schemaName}".permissions`)} p ON rp.permission_id = p.id
          WHERE rp.role_id = ${role.id}
        `;
        
        const permResults = await this.db.execute(permQuery);
        const permissions = permResults.rows as any[];

        // Compute name and slug from resource + action
        role.permissions = permissions.map((p: any) => ({
          ...p,
          name: `${p.resource}.${p.action}`,
          slug: `${p.resource}.${p.action}`,
        }));
      }

      return roles;
    });
  }
}
