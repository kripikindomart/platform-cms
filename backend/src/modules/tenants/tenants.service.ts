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
      // 1. Generate slug
      const slug = this.generateSlug(dto.name);
      schemaName = `tenant_${slug}`;

      this.logger.log(`Starting tenant provisioning: ${dto.name} (${slug})`);

      // 2. Check if slug already exists
      const existing = await this.tenantsRepository.findBySlug(slug);
      if (existing) {
        throw new ConflictException({
          code: 'TENANT_SLUG_EXISTS',
          message: `Tenant dengan slug '${slug}' sudah ada`,
        });
      }

      // 3. Create tenant record
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

      // 4. Create schema
      this.logger.log(`Creating schema: ${schemaName}`);
      await this.tenantSchemaService.createTenantSchema(schemaName);

      // 5. Create tables (run migrations)
      this.logger.log(`Creating tables in ${schemaName}...`);
      await this.createTenantTables(schemaName);

      // 6. Seed default data
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
      // Create users table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          avatar_url VARCHAR(500),
          is_active BOOLEAN NOT NULL DEFAULT true,
          is_verified BOOLEAN NOT NULL DEFAULT false,
          last_login_at TIMESTAMP WITH TIME ZONE,
          last_login_ip VARCHAR(45),
          must_change_password BOOLEAN NOT NULL DEFAULT false,
          password_changed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          created_by BIGINT,
          updated_by BIGINT,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT
        )
      `);

      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at)
      `);

      // Create roles table
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
          created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT REFERENCES users(id) ON DELETE SET NULL
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
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
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
          assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
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
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
          user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
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
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
          created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT REFERENCES users(id) ON DELETE SET NULL
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
          created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT REFERENCES users(id) ON DELETE SET NULL
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
          enabled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          disabled_at TIMESTAMP WITH TIME ZONE,
          disabled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
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
   * Generate URL-friendly slug
   */
  private generateSlug(name: string): string {
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
    const { page = 1, limit = 10, sort = 'created_at', order = 'asc', search, is_active, subscription_tier } = query;

    const result = await this.tenantsRepository.findAllPaginated({
      page,
      limit,
      sort,
      order,
      search,
      is_active,
      subscription_tier,
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
    // Generate slug
    const slug = this.generateSlug(dto.name);
    const schemaName = `tenant_${slug}`;

    this.logger.log(`Creating tenant: ${dto.name} (${slug}) by user ${userId}`);

    // Check if slug already exists
    const existing = await this.tenantsRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException({
        code: 'TENANT_SLUG_EXISTS',
        message: `Tenant dengan slug '${slug}' sudah ada`,
      });
    }

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
}
