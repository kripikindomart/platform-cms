import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { TenantsRepository } from './tenants.repository';
import { TenantSchemaService } from '../../database/tenant-schema.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { QueryTenantDto } from './dto/query-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { TenantProvisionResult } from './interfaces/tenant-provision.interface';
import * as publicSchema from '../../database/schema/public';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly tenantsRepository: TenantsRepository,
    private readonly tenantSchemaService: TenantSchemaService,
    @Inject('DRIZZLE')
    private readonly db: NodePgDatabase<typeof publicSchema>,
  ) {}

  /**
   * Provision new tenant dengan complete setup
   */
  async provisionTenant(
    dto: CreateTenantDto,
  ): Promise<TenantProvisionResult> {
    let tenantId: number | null = null;
    let schemaName: string | null = null;

    try {
      // 1. Generate random slug (26 chars like Supabase)
      const slug = await this.generateSlug();
      schemaName = `tenant_${slug}`;

      this.logger.log(`Starting tenant provisioning: ${dto.name} (${slug})`);

      // 2. Create tenant record
      this.logger.log(`Creating tenant record...`);
      const tenant = await this.tenantsRepository.create({
        name: dto.name,
        slug,
        domain: dto.domain ?? null,
        schema_name: schemaName,
        subscription_tier: dto.subscription_tier || 'free',
        config: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      tenantId = tenant.id;

      // 3. Create schema
      this.logger.log(`Creating schema: ${schemaName}`);
      await this.tenantSchemaService.createTenantSchema(schemaName);

      // 4. Create tables (run migrations)
      this.logger.log(`Creating tables in ${schemaName}...`);
      await this.createTenantTables(schemaName);

      // 5. Seed default data
      this.logger.log(`Seeding default data...`);
      const { rolesSeeded, permissionsSeeded } =
        await this.seedDefaultData(schemaName);

      this.logger.log(
        `✅ Tenant provisioned successfully: ${tenant.name} (ID: ${tenant.id})`,
      );

      return {
        success: true,
        tenant: new TenantResponseDto(tenant),
        schemaCreated: true,
        tablesCreated: 11,
        rolesSeeded,
        permissionsSeeded,
        message: `Tenant '${tenant.name}' berhasil dibuat`,
      };
    } catch (error) {
      this.logger.error(
        `Provisioning failed, rolling back...`,
        error instanceof Error ? error.stack : error,
      );

      // Rollback
      await this.rollbackProvision(tenantId, schemaName);

      throw error;
    }
  }

  /**
   * Create tables dalam tenant schema
   */
  private async createTenantTables(schemaName: string): Promise<void> {
    // Set search_path ke tenant schema
    await this.db.execute(
      sql.raw(`SET search_path TO "${schemaName}", public`),
    );

    try {
      // Create roles table (FK to public.users)
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS roles (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          display_name VARCHAR(255) NOT NULL,
          description TEXT,
          is_system BOOLEAN NOT NULL DEFAULT false,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
        )
      `);

      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_name ON roles(name)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_roles_is_system ON roles(is_system)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_roles_deleted_at ON roles(deleted_at)
      `);

      // Create permissions table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS permissions (
          id BIGSERIAL PRIMARY KEY,
          resource VARCHAR(100) NOT NULL,
          action VARCHAR(50) NOT NULL,
          scope VARCHAR(50) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE(resource, action, scope)
        )
      `);

      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action)
      `);

      // Create user_roles junction table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_roles (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          assigned_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          UNIQUE(user_id, role_id)
        )
      `);

      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id)
      `);

      // Create role_permissions junction table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id BIGSERIAL PRIMARY KEY,
          role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          assigned_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          UNIQUE(role_id, permission_id)
        )
      `);

      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id)
      `);

      // Create sessions table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
      `);

      // Create audit_logs table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          action VARCHAR(100) NOT NULL,
          entity_type VARCHAR(100) NOT NULL,
          entity_id BIGINT,
          changes TEXT,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)
      `);

      // Create password_resets table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS password_resets (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at)
      `);

      // Create categories table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS categories (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
        )
      `);

      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at)
      `);

      // Create tags table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS tags (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(7),
          usage_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
        )
      `);

      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags(name)
      `);
      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_tags_deleted_at ON tags(deleted_at)
      `);

      // Create tenant_modules table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS tenant_modules (
          id BIGSERIAL PRIMARY KEY,
          tenant_id BIGINT NOT NULL,
          module_id BIGINT NOT NULL,
          is_enabled BOOLEAN NOT NULL DEFAULT true,
          config TEXT,
          enabled_at TIMESTAMP WITH TIME ZONE,
          enabled_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          disabled_at TIMESTAMP WITH TIME ZONE,
          disabled_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE(tenant_id, module_id)
        )
      `);

      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant_id ON tenant_modules(tenant_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_tenant_modules_module_id ON tenant_modules(module_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_tenant_modules_is_enabled ON tenant_modules(is_enabled)
      `);

      this.logger.log(`✓ Created 11 tables in ${schemaName}`);
    } finally {
      // Reset search_path
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Seed default data (roles & permissions)
   */
  private async seedDefaultData(
    schemaName: string,
  ): Promise<{ rolesSeeded: number; permissionsSeeded: number }> {
    await this.db.execute(
      sql.raw(`SET search_path TO "${schemaName}", public`),
    );

    // Seed roles
    const roles = [
      {
        name: 'super_admin',
        display_name: 'Super Administrator',
        is_system: true,
      },
      { name: 'admin', display_name: 'Administrator', is_system: true },
      { name: 'user', display_name: 'User', is_system: false },
    ];

    for (const role of roles) {
      await this.db.execute(sql`
        INSERT INTO roles (name, display_name, is_system, is_active, created_at, updated_at)
        VALUES (${role.name}, ${role.display_name}, ${role.is_system}, true, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `);
    }

    // Seed basic permissions
    const permissions = [
      { resource: 'users', action: 'create', scope: 'tenant' },
      { resource: 'users', action: 'read', scope: 'tenant' },
      { resource: 'users', action: 'update', scope: 'tenant' },
      { resource: 'users', action: 'delete', scope: 'tenant' },
      { resource: 'users', action: 'read', scope: 'own' },
      { resource: 'users', action: 'update', scope: 'own' },
      { resource: 'roles', action: 'create', scope: 'tenant' },
      { resource: 'roles', action: 'read', scope: 'tenant' },
      { resource: 'roles', action: 'update', scope: 'tenant' },
      { resource: 'roles', action: 'delete', scope: 'tenant' },
    ];

    for (const perm of permissions) {
      await this.db.execute(sql`
        INSERT INTO permissions (resource, action, scope, created_at)
        VALUES (${perm.resource}, ${perm.action}, ${perm.scope}, NOW())
        ON CONFLICT (resource, action, scope) DO NOTHING
      `);
    }

    await this.db.execute(sql.raw(`RESET search_path`));

    return {
      rolesSeeded: roles.length,
      permissionsSeeded: permissions.length,
    };
  }

  /**
   * Rollback provision on failure
   */
  private async rollbackProvision(
    tenantId: number | null,
    schemaName: string | null,
  ): Promise<void> {
    this.logger.warn(`Rolling back tenant provision...`);

    try {
      // Drop schema if created
      if (schemaName) {
        const exists = await this.tenantSchemaService.schemaExists(schemaName);
        if (exists) {
          await this.tenantSchemaService.dropTenantSchema(schemaName);
          this.logger.log(`✓ Schema ${schemaName} dropped`);
        }
      }

      // Delete tenant record if created
      if (tenantId) {
        await this.tenantsRepository.hardDelete(tenantId);
        this.logger.log(`✓ Tenant record ${tenantId} deleted`);
      }

      this.logger.log(`✅ Rollback completed`);
    } catch (rollbackError) {
      this.logger.error(
        `Rollback failed:`,
        rollbackError instanceof Error ? rollbackError.stack : rollbackError,
      );
      // Don't throw - rollback error shouldn't mask original error
    }
  }

  /**
   * Generate URL-friendly random slug (Supabase-style)
   * 26 random lowercase alphanumeric characters
   */
  private async generateSlug(): Promise<string> {
    const { customAlphabet } = await import('nanoid');
    const generateRandomSlug = customAlphabet(
      'abcdefghijklmnopqrstuvwxyz0123456789',
      26
    );

    let slug = generateRandomSlug();
    let isUnique = false;

    // Ensure uniqueness
    while (!isUnique) {
      const existing = await this.tenantsRepository.findBySlug(slug);
      if (!existing) {
        isUnique = true;
      } else {
        slug = generateRandomSlug();
      }
    }

    return slug;
  }

  /**
   * Generate URL-friendly slug from name (legacy, for backwards compatibility)
   * Prefer generateSlug() for new tenants
   */
  private generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s_]/g, '') // Remove special chars, keep underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/_+/g, '_') // Replace multiple underscores
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Find all tenants with pagination, filtering, sorting
   */
  async findAll(query: any) {
    const { page = 1, limit = 10, sort = 'created_at', order = 'asc', search, is_active, subscription_tier, includeDeleted } = query;

    const result = await this.tenantsRepository.findAllPaginated({
      page,
      limit,
      sort,
      order,
      search,
      is_active,
      subscription_tier,
      includeDeleted,
    });

    return {
      data: result.data.map(tenant => new TenantResponseDto(tenant)),
      meta: result.meta,
    };
  }

  /**
   * Find tenant by ID
   */
  async findById(id: number): Promise<TenantResponseDto> {
    const tenant = await this.tenantsRepository.findById(id);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }
    return new TenantResponseDto(tenant);
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<TenantResponseDto | null> {
    const tenant = await this.tenantsRepository.findBySlug(slug);
    return tenant ? new TenantResponseDto(tenant) : null;
  }

  /**
   * Create tenant (simplified version for admin, without full provisioning)
   */
  async create(dto: CreateTenantDto, userId: number): Promise<TenantResponseDto> {
    // Generate random slug (26 chars)
    const slug = await this.generateSlug();
    const schemaName = `tenant_${slug}`;

    this.logger.log(`Creating tenant: ${dto.name} (${slug}) by user ${userId}`);

    // Create tenant record
    const tenant = await this.tenantsRepository.create({
      name: dto.name,
      slug,
      domain: dto.domain ?? null,
      schema_name: schemaName,
      subscription_tier: dto.subscription_tier || 'free',
      config: null,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log(`✅ Tenant created successfully: ${tenant.name} (ID: ${tenant.id})`);

    return new TenantResponseDto(tenant);
  }

  /**
   * Update tenant
   */
  async update(id: number, dto: any, userId: number): Promise<TenantResponseDto> {
    this.logger.log(`Updating tenant ID ${id} by user ${userId}`);

    // Check if tenant exists
    const existing = await this.tenantsRepository.findById(id);
    if (!existing) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    // Update tenant
    const updateData: any = {
      updated_at: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.domain !== undefined) updateData.domain = dto.domain;
    if (dto.subscription_tier !== undefined) updateData.subscription_tier = dto.subscription_tier;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const tenant = await this.tenantsRepository.update(id, updateData);

    this.logger.log(`✅ Tenant updated successfully: ${tenant.name} (ID: ${tenant.id})`);

    return new TenantResponseDto(tenant);
  }

  /**
   * Soft delete tenant
   */
  async delete(id: number, userId: number): Promise<void> {
    this.logger.log(`Deleting tenant ID ${id} by user ${userId}`);

    // Check if tenant exists
    const existing = await this.tenantsRepository.findById(id);
    if (!existing) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    // Soft delete tenant
    await this.tenantsRepository.softDelete(id, userId);

    this.logger.log(`✅ Tenant deleted successfully: ID ${id}`);
  }

  /**
   * Restore soft deleted tenant
   */
  async restore(id: number): Promise<TenantResponseDto> {
    this.logger.log(`Restoring tenant ID ${id}`);

    const tenant = await this.tenantsRepository.restore(id);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    this.logger.log(`✅ Tenant restored successfully: ${tenant.name} (ID: ${tenant.id})`);

    return new TenantResponseDto(tenant);
  }

  /**
   * Permanently delete tenant
   */
  async hardDelete(id: number): Promise<void> {
    this.logger.log(`Permanently deleting tenant ID ${id}`);

    // Check if tenant exists (including soft deleted)
    const existing = await this.tenantsRepository.findById(id, true);
    if (!existing) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    // Hard delete tenant
    await this.tenantsRepository.hardDelete(id);

    this.logger.log(`✅ Tenant permanently deleted: ID ${id}`);
  }

  /**
   * Assign user to tenant with specific role
   */
  async assignUserToTenant(
    tenantId: number,
    userId: number,
    roleName: string,
    assignedBy: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Assigning user ${userId} to tenant ${tenantId} with role ${roleName}`);

    // Check if tenant exists
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if role exists in tenant
      const roleResult = await this.db.execute(sql`
        SELECT id FROM roles WHERE name = ${roleName} LIMIT 1
      `);

      if (!roleResult.rows.length) {
        throw new ConflictException({
          code: 'ROLE_NOT_FOUND',
          message: `Role '${roleName}' tidak ditemukan di tenant ${tenant.slug}`,
        });
      }

      const roleId = (roleResult.rows[0] as any).id;

      // Check if user already assigned
      const existingResult = await this.db.execute(sql`
        SELECT id FROM user_roles WHERE user_id = ${userId} AND role_id = ${roleId}
      `);

      if (existingResult.rows.length > 0) {
        return {
          success: true,
          message: `User sudah memiliki role ${roleName} di tenant ${tenant.name}`,
        };
      }

      // Assign user to tenant
      await this.db.execute(sql`
        INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
        VALUES (${userId}, ${roleId}, ${assignedBy}, NOW())
      `);

      this.logger.log(
        `✅ User ${userId} assigned to tenant ${tenant.slug} with role ${roleName}`,
      );

      return {
        success: true,
        message: `User berhasil di-assign ke tenant ${tenant.name} dengan role ${roleName}`,
      };
    } finally {
      // Reset search path
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Bulk add users to tenant
   */
  async bulkAddUsers(
    tenantId: number,
    userIds: number[],
    defaultRoleId: number | undefined,
    assignedBy: number,
  ): Promise<{ success: number; failed: number; message: string }> {
    this.logger.log(`Bulk adding ${userIds.length} users to tenant ${tenantId}`);

    // Check if tenant exists
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      let successCount = 0;
      let failedCount = 0;

      // Get default role if not provided
      let roleId = defaultRoleId;
      if (!roleId) {
        // Use 'user' role as default
        const roleResult = await this.db.execute(sql`
          SELECT id FROM roles WHERE name = 'user' LIMIT 1
        `);
        
        if (!roleResult.rows.length) {
          throw new ConflictException({
            code: 'DEFAULT_ROLE_NOT_FOUND',
            message: `Role default 'user' tidak ditemukan di tenant ${tenant.slug}`,
          });
        }
        
        roleId = (roleResult.rows[0] as any).id;
      }

      // Process each user
      for (const userId of userIds) {
        try {
          // Check if user already assigned
          const existingResult = await this.db.execute(sql`
            SELECT id FROM user_roles 
            WHERE user_id = ${userId} AND role_id = ${roleId}
          `);

          if (existingResult.rows.length > 0) {
            this.logger.warn(`User ${userId} sudah memiliki role di tenant ${tenantId}`);
            failedCount++;
            continue;
          }

          // Insert user role
          await this.db.execute(sql`
            INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
            VALUES (${userId}, ${roleId}, ${assignedBy}, NOW())
          `);

          successCount++;
          this.logger.log(`✓ User ${userId} added to tenant ${tenantId}`);
        } catch (error) {
          this.logger.error(`Failed to add user ${userId}:`, error);
          failedCount++;
        }
      }

      this.logger.log(
        `✅ Bulk add complete: ${successCount} success, ${failedCount} failed`,
      );

      return {
        success: successCount,
        failed: failedCount,
        message: `${successCount} user berhasil ditambahkan ke tenant ${tenant.name}`,
      };
    } finally {
      // Reset search path
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Enable module for tenant
   */
  async enableModule(
    tenantId: number,
    moduleId: number,
    enabledBy: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Enabling module ${moduleId} for tenant ${tenantId}`);

    // Check if tenant exists
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if module already exists
      const existingResult = await this.db.execute(sql`
        SELECT id, is_enabled FROM tenant_modules 
        WHERE tenant_id = ${tenantId} AND module_id = ${moduleId}
      `);

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0] as any;
        if (existing.is_enabled) {
          return {
            success: true,
            message: `Module sudah aktif untuk tenant ${tenant.name}`,
          };
        }

        // Update to enable
        await this.db.execute(sql`
          UPDATE tenant_modules 
          SET is_enabled = true, 
              enabled_at = NOW(), 
              enabled_by = ${enabledBy},
              updated_at = NOW()
          WHERE id = ${existing.id}
        `);
      } else {
        // Insert new record
        await this.db.execute(sql`
          INSERT INTO tenant_modules (
            tenant_id, module_id, is_enabled, enabled_at, enabled_by, created_at, updated_at
          )
          VALUES (
            ${tenantId}, ${moduleId}, true, NOW(), ${enabledBy}, NOW(), NOW()
          )
        `);
      }

      this.logger.log(`✅ Module ${moduleId} enabled for tenant ${tenantId}`);

      return {
        success: true,
        message: `Module berhasil diaktifkan untuk tenant ${tenant.name}`,
      };
    } finally {
      // Reset search path
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Disable module for tenant
   */
  async disableModule(
    tenantId: number,
    moduleId: number,
    disabledBy: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Disabling module ${moduleId} for tenant ${tenantId}`);

    // Check if tenant exists
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if module exists
      const existingResult = await this.db.execute(sql`
        SELECT id, is_enabled FROM tenant_modules 
        WHERE tenant_id = ${tenantId} AND module_id = ${moduleId}
      `);

      if (existingResult.rows.length === 0) {
        return {
          success: false,
          message: `Module tidak terdaftar untuk tenant ${tenant.name}`,
        };
      }

      const existing = existingResult.rows[0] as any;
      if (!existing.is_enabled) {
        return {
          success: true,
          message: `Module sudah non-aktif untuk tenant ${tenant.name}`,
        };
      }

      // Update to disable
      await this.db.execute(sql`
        UPDATE tenant_modules 
        SET is_enabled = false, 
            disabled_at = NOW(), 
            disabled_by = ${disabledBy},
            updated_at = NOW()
        WHERE id = ${existing.id}
      `);

      this.logger.log(`✅ Module ${moduleId} disabled for tenant ${tenantId}`);

      return {
        success: true,
        message: `Module berhasil dinonaktifkan untuk tenant ${tenant.name}`,
      };
    } finally {
      // Reset search path
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Get tenant details with statistics
   */
  async getTenantDetails(id: number) {
    this.logger.log(`Getting tenant details with stats for ID ${id}`);

    // Get tenant info
    const tenant = await this.tenantsRepository.findById(id);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if user_roles has deleted_at column
      const columnExistsResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = ${schemaName}
          AND table_name = 'user_roles'
          AND column_name = 'deleted_at'
        ) as exists
      `);

      const hasSoftDelete = (columnExistsResult.rows[0] as any)?.exists;

      // Get users count (only active)
      const whereClause = hasSoftDelete 
        ? sql`WHERE deleted_at IS NULL`
        : sql``;

      const usersResult = await this.db.execute(sql`
        SELECT COUNT(DISTINCT user_id) as count FROM user_roles ${whereClause}
      `);
      const usersCount = Number((usersResult.rows[0] as any)?.count || 0);

      // Get roles count
      const rolesResult = await this.db.execute(sql`
        SELECT COUNT(*) as count FROM roles WHERE deleted_at IS NULL
      `);
      const rolesCount = Number((rolesResult.rows[0] as any)?.count || 0);

      // Get permissions count
      const permissionsResult = await this.db.execute(sql`
        SELECT COUNT(*) as count FROM permissions
      `);
      const permissionsCount = Number((permissionsResult.rows[0] as any)?.count || 0);

      // Get modules count (from tenant_modules table if exists)
      let modulesCount = 0;
      try {
        const modulesResult = await this.db.execute(sql`
          SELECT COUNT(*) as count FROM tenant_modules WHERE is_enabled = true
        `);
        modulesCount = Number((modulesResult.rows[0] as any)?.count || 0);
      } catch (error) {
        // Table might not exist yet
        this.logger.warn(`tenant_modules table not found for ${schemaName}`);
      }

      // Get recent activity count (last 7 days)
      let activityCount = 0;
      try {
        const activityResult = await this.db.execute(sql`
          SELECT COUNT(*) as count 
          FROM audit_logs 
          WHERE created_at >= NOW() - INTERVAL '7 days'
        `);
        activityCount = Number((activityResult.rows[0] as any)?.count || 0);
      } catch (error) {
        this.logger.warn(`audit_logs table not found for ${schemaName}`);
      }

      return {
        tenant: new TenantResponseDto(tenant),
        stats: {
          users: usersCount,
          roles: rolesCount,
          permissions: permissionsCount,
          modules: modulesCount,
          activity: activityCount,
        },
      };
    } finally {
      // Reset search path
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Get users belonging to tenant
   * Shows ALL users including those with soft-deleted roles (they show as inactive)
   */
  async getTenantUsers(tenantId: number, page: number = 1, limit: number = 10, search?: string) {
    this.logger.log(`Getting users for tenant ${tenantId} (including soft-deleted)${search ? ` with search: ${search}` : ''}`);

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;
    const offset = (page - 1) * limit;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if user_roles has deleted_at column
      const columnExistsResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = ${schemaName}
          AND table_name = 'user_roles'
          AND column_name = 'deleted_at'
        ) as exists
      `);

      const hasSoftDelete = (columnExistsResult.rows[0] as any)?.exists;
      
      this.logger.log(`Tenant ${tenantId} has soft delete support: ${hasSoftDelete}`);

      // Build search condition
      const searchCondition = search 
        ? sql`AND (u.email ILIKE ${`%${search}%`} OR u.name ILIKE ${`%${search}%`})`
        : sql``;

      // Get users with their roles
      // Show ALL users even if all their roles are soft-deleted
      const usersResult = await this.db.execute(sql`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.is_active,
          u.last_login_at,
          u.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', r.id,
                'name', r.name,
                'display_name', r.display_name
              ) ORDER BY r.display_name
            ) FILTER (WHERE r.id IS NOT NULL ${hasSoftDelete ? sql`AND ur.deleted_at IS NULL` : sql``}),
            '[]'
          ) as roles,
          ${hasSoftDelete ? sql`
            CASE 
              WHEN COUNT(*) FILTER (WHERE ur.deleted_at IS NULL) > 0 THEN true
              ELSE false
            END as has_active_roles
          ` : sql`true as has_active_roles`}
        FROM user_roles ur
        INNER JOIN public.users u ON u.id = ur.user_id
        LEFT JOIN roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
        WHERE u.deleted_at IS NULL ${searchCondition}
        GROUP BY u.id, u.email, u.name, u.is_active, u.last_login_at, u.created_at
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      this.logger.log(`Found ${usersResult.rows.length} users for tenant ${tenantId}`);

      // Map results to show correct active status based on role assignments
      const mappedUsers = usersResult.rows.map((user: any) => {
        const isActive = user.has_active_roles;
        this.logger.log(`User ${user.id} (${user.email}): has_active_roles=${user.has_active_roles}, mapped is_active=${isActive}`);
        return {
          ...user,
          is_active: isActive, // Override with actual role status
        };
      });

      // Get total count of unique users (all users in tenant)
      const countResult = await this.db.execute(sql`
        SELECT COUNT(DISTINCT ur.user_id) as count 
        FROM user_roles ur
        INNER JOIN public.users u ON u.id = ur.user_id
        WHERE u.deleted_at IS NULL ${searchCondition}
      `);
      const total = Number((countResult.rows[0] as any)?.count || 0);

      this.logger.log(`Total users in tenant ${tenantId}: ${total}`);

      return {
        data: mappedUsers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } finally {
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Get modules registered for tenant
   */
  async getTenantModules(tenantId: number) {
    this.logger.log(`Getting modules for tenant ${tenantId}`);

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if tenant_modules table exists
      const tableExistsResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = ${schemaName}
          AND table_name = 'tenant_modules'
        ) as exists
      `);

      const tableExists = (tableExistsResult.rows[0] as any)?.exists;

      if (!tableExists) {
        return {
          data: [],
          message: 'Tenant modules table not yet created',
        };
      }

      // Get modules
      const modulesResult = await this.db.execute(sql`
        SELECT 
          id,
          tenant_id,
          module_id,
          is_enabled,
          config,
          enabled_at,
          disabled_at,
          created_at,
          updated_at
        FROM tenant_modules
        ORDER BY created_at DESC
      `);

      return {
        data: modulesResult.rows,
      };
    } finally {
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Remove user from tenant (soft delete - hanya di tenant ini)
   */
  async removeUserFromTenant(
    tenantId: number,
    userId: number,
    removedBy: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Removing user ${userId} from tenant ${tenantId}`);

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if user exists in this tenant
      const userRoleResult = await this.db.execute(sql`
        SELECT COUNT(*) as count FROM user_roles WHERE user_id = ${userId}
      `);

      const userExists = Number((userRoleResult.rows[0] as any)?.count || 0) > 0;

      if (!userExists) {
        throw new ConflictException({
          code: 'USER_NOT_IN_TENANT',
          message: `User tidak terdaftar di tenant ${tenant.name}`,
        });
      }

      // Check if user_roles has deleted_at column (for soft delete support)
      const columnExistsResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = ${schemaName}
          AND table_name = 'user_roles'
          AND column_name = 'deleted_at'
        ) as exists
      `);

      const hasSoftDelete = (columnExistsResult.rows[0] as any)?.exists;

      if (hasSoftDelete) {
        // Soft delete - preserve roles for restoration
        await this.db.execute(sql`
          UPDATE user_roles 
          SET deleted_at = NOW(), deleted_by = ${removedBy}
          WHERE user_id = ${userId} AND deleted_at IS NULL
        `);
      } else {
        // Hard delete (fallback if schema doesn't support soft delete yet)
        await this.db.execute(sql`
          DELETE FROM user_roles WHERE user_id = ${userId}
        `);
      }

      this.logger.log(
        `✅ User ${userId} removed from tenant ${tenant.name}`,
      );

      return {
        success: true,
        message: `User berhasil dinonaktifkan dari tenant ${tenant.name}. User masih aktif di tenant lain.`,
      };
    } finally {
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Restore user to tenant (restore with original roles)
   */
  async restoreUserToTenant(
    tenantId: number,
    userId: number,
    restoredBy: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Restoring user ${userId} to tenant ${tenantId}`);

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    const schemaName = tenant.schema_name;

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      // Check if user_roles has deleted_at column (for soft delete support)
      const columnExistsResult = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = ${schemaName}
          AND table_name = 'user_roles'
          AND column_name = 'deleted_at'
        ) as exists
      `);

      const hasSoftDelete = (columnExistsResult.rows[0] as any)?.exists;

      if (hasSoftDelete) {
        // Check if there are soft-deleted roles to restore
        const deletedRolesResult = await this.db.execute(sql`
          SELECT COUNT(*) as count 
          FROM user_roles 
          WHERE user_id = ${userId} AND deleted_at IS NOT NULL
        `);

        const hasDeletedRoles = Number((deletedRolesResult.rows[0] as any)?.count || 0) > 0;

        if (hasDeletedRoles) {
          // Restore original roles by removing deleted_at
          await this.db.execute(sql`
            UPDATE user_roles 
            SET deleted_at = NULL, deleted_by = NULL
            WHERE user_id = ${userId} AND deleted_at IS NOT NULL
          `);

          // Get restored roles for message
          const rolesResult = await this.db.execute(sql`
            SELECT r.display_name
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = ${userId} AND ur.deleted_at IS NULL
          `);

          const roleNames = rolesResult.rows.map((row: any) => row.display_name).join(', ');

          this.logger.log(
            `✅ User ${userId} restored to tenant ${tenant.name} with original roles: ${roleNames}`,
          );

          return {
            success: true,
            message: `User berhasil diaktifkan kembali di tenant ${tenant.name} dengan role: ${roleNames}`,
          };
        }
      }

      // If no soft-deleted roles found, check if user already active
      const activeRolesResult = await this.db.execute(sql`
        SELECT COUNT(*) as count 
        FROM user_roles 
        WHERE user_id = ${userId} 
        ${hasSoftDelete ? sql`AND deleted_at IS NULL` : sql``}
      `);

      const hasActiveRoles = Number((activeRolesResult.rows[0] as any)?.count || 0) > 0;

      if (hasActiveRoles) {
        return {
          success: true,
          message: `User sudah aktif di tenant ${tenant.name}`,
        };
      }

      // If no soft-deleted roles and no active roles, user tidak pernah ada di tenant ini
      throw new ConflictException({
        code: 'USER_NOT_FOUND_IN_TENANT',
        message: `User tidak memiliki history di tenant ${tenant.name}. Gunakan "Assign User" untuk menambahkan user baru.`,
      });
    } finally {
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }
}
