import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { TenantsRepository } from './tenants.repository';
import { TenantSchemaBackupsRepository } from './tenant-schema-backups.repository';
import { TenantSchemaService } from '../../database/tenant-schema.service';
import { TenantContextService } from '../../common/context/tenant-context.service';
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
    private readonly tenantSchemaBackupsRepository: TenantSchemaBackupsRepository,
    private readonly tenantSchemaService: TenantSchemaService,
    private readonly tenantContext: TenantContextService,
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
        tablesCreated: 14,
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

      // Create menus table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS menus (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          icon VARCHAR(50),
          "order" INTEGER NOT NULL DEFAULT 0,
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
        CREATE UNIQUE INDEX IF NOT EXISTS idx_menus_slug ON menus(slug)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_menus_order ON menus("order")
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_menus_deleted_at ON menus(deleted_at)
      `);

      // Create menu_items table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS menu_items (
          id BIGSERIAL PRIMARY KEY,
          menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
          parent_id BIGINT REFERENCES menu_items(id) ON DELETE CASCADE,
          module_name VARCHAR(100) NOT NULL,
          label VARCHAR(100) NOT NULL,
          url VARCHAR(255) NOT NULL,
          icon VARCHAR(50),
          "order" INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          required_permission VARCHAR(100),
          metadata TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
        )
      `);

      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items("order")
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_menu_items_deleted_at ON menu_items(deleted_at)
      `);

      // Create upload_settings table
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS upload_settings (
          id BIGSERIAL PRIMARY KEY,
          category VARCHAR(50) NOT NULL UNIQUE CHECK (category IN ('image', 'document', 'video', 'audio', 'other')),
          url_format VARCHAR(100) NOT NULL CHECK (url_format IN ('direct_view', 'thumbnail', 'download', 'embed_view')),
          thumbnail_size INTEGER CHECK (thumbnail_size >= 100 AND thumbnail_size <= 2000),
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
        CREATE UNIQUE INDEX IF NOT EXISTS idx_upload_settings_category ON upload_settings(category)
      `);
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_upload_settings_is_active ON upload_settings(is_active)
      `);

      this.logger.log(`✓ Created 14 tables in ${schemaName}`);
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

    // Seed upload_settings permissions
    const uploadSettingsPermissions = [
      {
        resource: 'upload-settings',
        action: 'read',
        scope: 'tenant',
        description: 'Permission to view and list upload-settings',
      },
      {
        resource: 'upload-settings',
        action: 'create',
        scope: 'tenant',
        description: 'Permission to create new upload-settings',
      },
      {
        resource: 'upload-settings',
        action: 'update',
        scope: 'tenant',
        description: 'Permission to update existing upload-settings',
      },
      {
        resource: 'upload-settings',
        action: 'delete',
        scope: 'tenant',
        description: 'Permission to delete upload-settings',
      },
    ];

    for (const perm of uploadSettingsPermissions) {
      await this.db.execute(sql`
        INSERT INTO permissions (resource, action, scope, description, created_at)
        VALUES (${perm.resource}, ${perm.action}, ${perm.scope}, ${perm.description}, NOW())
        ON CONFLICT (resource, action, scope) DO NOTHING
      `);
    }

    // Assign all permissions to admin role
    const adminRoleResult = await this.db.execute(sql`
      SELECT id FROM roles WHERE name = 'admin' LIMIT 1
    `);
    const adminRoleRows = adminRoleResult.rows || adminRoleResult;
    const adminRole = Array.isArray(adminRoleRows) ? adminRoleRows[0] : null;

    if (adminRole) {
      const allPermissionsResult = await this.db.execute(sql`
        SELECT id FROM permissions
      `);
      const allPermissions = allPermissionsResult.rows || allPermissionsResult;

      for (const perm of allPermissions) {
        await this.db.execute(sql`
          INSERT INTO role_permissions (role_id, permission_id, assigned_at)
          VALUES (${adminRole.id}, ${perm.id}, NOW())
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `);
      }
    }

    // Seed main menu
    const mainMenuResult = await this.db.execute(sql`
      INSERT INTO menus (name, slug, icon, "order", is_active, created_at, updated_at)
      VALUES ('Main Menu', 'main-menu', 'LayoutDashboard', 1, true, NOW(), NOW())
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `);
    const mainMenuRows = mainMenuResult.rows || mainMenuResult;
    const mainMenu = Array.isArray(mainMenuRows) ? mainMenuRows[0] : null;

    // Seed upload_settings menu item
    if (mainMenu) {
      await this.db.execute(sql`
        INSERT INTO menu_items 
        (menu_id, module_name, label, url, icon, required_permission, "order", is_active, created_at, updated_at)
        VALUES (
          ${mainMenu.id}, 
          'upload-settings', 
          'Upload Settings', 
          '/portal/upload-settings', 
          'Settings', 
          'upload-settings.read.tenant', 
          1, 
          true, 
          NOW(), 
          NOW()
        )
        ON CONFLICT DO NOTHING
      `);
    }

    // Seed default upload_settings
    const defaultUploadSettings = [
      {
        category: 'image',
        url_format: 'direct_view',
        thumbnail_size: 300,
        is_active: true,
      },
      {
        category: 'document',
        url_format: 'download',
        thumbnail_size: null,
        is_active: true,
      },
      {
        category: 'video',
        url_format: 'embed_view',
        thumbnail_size: null,
        is_active: true,
      },
      {
        category: 'audio',
        url_format: 'download',
        thumbnail_size: null,
        is_active: true,
      },
      {
        category: 'other',
        url_format: 'download',
        thumbnail_size: null,
        is_active: true,
      },
    ];

    for (const setting of defaultUploadSettings) {
      await this.db.execute(sql`
        INSERT INTO upload_settings (category, url_format, thumbnail_size, is_active, created_at, updated_at)
        VALUES (${setting.category}, ${setting.url_format}, ${setting.thumbnail_size}, ${setting.is_active}, NOW(), NOW())
        ON CONFLICT (category) DO NOTHING
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
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.domain !== undefined) updateData.domain = dto.domain;
    if (dto.subscription_tier !== undefined) updateData.subscription_tier = dto.subscription_tier;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
    
    // Branding fields
    if (dto.logo_url !== undefined) updateData.logo_url = dto.logo_url;
    if (dto.primary_color !== undefined) updateData.primary_color = dto.primary_color;
    if (dto.secondary_color !== undefined) updateData.secondary_color = dto.secondary_color;

    const tenant = await this.tenantsRepository.update(id, updateData);

    this.logger.log(`✅ Tenant updated successfully: ${tenant.name} (ID: ${tenant.id})`);

    return new TenantResponseDto(tenant);
  }

  /**
   * Update tenant config
   */
  async updateConfig(id: number, config: Record<string, any>, userId: number): Promise<TenantResponseDto> {
    this.logger.log(`Updating tenant config ID ${id} by user ${userId}`);

    // Check if tenant exists
    const existing = await this.tenantsRepository.findById(id);
    if (!existing) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    // Merge with existing config
    const currentConfig = (typeof existing.config === 'object' && existing.config !== null) 
      ? (existing.config as Record<string, any>) 
      : {};
    const newConfig = {
      ...currentConfig,
      ...config,
    };

    // Update tenant
    const tenant = await this.tenantsRepository.update(id, {
      config: JSON.stringify(newConfig), // Convert to JSON string for database
      updated_at: new Date(),
    });

    this.logger.log(`✅ Tenant config updated successfully: ${tenant.name} (ID: ${tenant.id})`);

    return new TenantResponseDto(tenant);
  }

  /**
   * Soft delete tenant
   */
  async delete(id: number, userId: number): Promise<void> {
    this.logger.log(`Deleting tenant ID ${id} by user ${userId}`);

    // Check if tenant exists (including already deleted)
    const existing = await this.tenantsRepository.findById(id, true);
    if (!existing) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    // Check if already soft deleted
    if (existing.deleted_at) {
      throw new ConflictException({
        code: 'TENANT_ALREADY_DELETED',
        message: `Tenant dengan ID ${id} sudah dihapus sebelumnya`,
      });
    }

    // Prevent deleting the current tenant context
    const currentTenant = this.tenantContext.getTenant();
    if (currentTenant && currentTenant.id === id) {
      throw new ConflictException({
        code: 'CANNOT_DELETE_CURRENT_TENANT',
        message: `Tidak dapat menghapus tenant yang sedang aktif. Silakan switch ke tenant lain terlebih dahulu.`,
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
   * Permanently delete tenant (with option to backup schema)
   */
  async hardDelete(id: number, userId: number, backupSchema: boolean = true): Promise<void> {
    this.logger.log(`Permanently deleting tenant ID ${id} (backup: ${backupSchema})`);

    // Check if tenant exists (including soft deleted)
    const existing = await this.tenantsRepository.findById(id, true);
    if (!existing) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${id} tidak ditemukan`,
      });
    }

    const schemaName = existing.schema_name;

    if (backupSchema && schemaName) {
      // Check if schema exists
      const schemaExists = await this.tenantSchemaService.schemaExists(schemaName);
      
      if (schemaExists) {
        // Get schema info
        const schemaInfo = await this.tenantSchemaService.getSchemaInfo(schemaName);
        
        // Create backup record (15 days retention)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 15);
        
        await this.tenantSchemaBackupsRepository.create({
          tenant_id: existing.id,
          tenant_name: existing.name,
          tenant_slug: existing.slug,
          schema_name: schemaName,
          backup_reason: 'tenant_hard_delete',
          backup_size: schemaInfo.size,
          table_count: schemaInfo.tableCount,
          expires_at: expiresAt,
          created_at: new Date(),
          created_by: userId,
          metadata: {
            subscription_tier: existing.subscription_tier,
            deleted_at: existing.deleted_at,
            original_tenant_id: existing.id,
          },
        });

        this.logger.log(`✓ Schema backup created: ${schemaName} (expires in 15 days)`);
      }
    } else if (!backupSchema && schemaName) {
      // Drop schema immediately without backup
      const schemaExists = await this.tenantSchemaService.schemaExists(schemaName);
      if (schemaExists) {
        await this.tenantSchemaService.dropTenantSchema(schemaName);
        this.logger.log(`✓ Schema dropped immediately: ${schemaName}`);
      }
    }

    // Hard delete tenant record
    await this.tenantsRepository.hardDelete(id);

    this.logger.log(`✅ Tenant permanently deleted: ID ${id}`);
  }

  /**
   * Get all schema backups
   */
  async getSchemaBackups(): Promise<any[]> {
    const backups = await this.tenantSchemaBackupsRepository.findAll();
    
    return backups.map(backup => {
      const now = new Date();
      const daysRemaining = Math.ceil(
        (backup.expires_at.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...backup,
        days_remaining: daysRemaining,
        is_expired: daysRemaining <= 0,
      };
    });
  }

  /**
   * Delete schema backup permanently (drops schema and deletes backup record)
   */
  async deleteSchemaBackup(backupId: number, userId: number): Promise<void> {
    this.logger.log(`Deleting schema backup ID ${backupId}`);

    const backup = await this.tenantSchemaBackupsRepository.findById(backupId);
    if (!backup) {
      throw new ConflictException({
        code: 'BACKUP_NOT_FOUND',
        message: `Schema backup dengan ID ${backupId} tidak ditemukan`,
      });
    }

    // Drop schema if exists
    const schemaExists = await this.tenantSchemaService.schemaExists(backup.schema_name);
    if (schemaExists) {
      await this.tenantSchemaService.dropTenantSchema(backup.schema_name);
      this.logger.log(`✓ Schema dropped: ${backup.schema_name}`);
    }

    // Delete backup record
    await this.tenantSchemaBackupsRepository.hardDelete(backupId);

    this.logger.log(`✅ Schema backup deleted permanently: ID ${backupId}`);
  }

  /**
   * Cleanup expired schema backups (runs via cron)
   */
  async cleanupExpiredSchemaBackups(): Promise<{ deleted: number; failed: number }> {
    this.logger.log('Running expired schema backups cleanup...');

    const expiredBackups = await this.tenantSchemaBackupsRepository.findExpired();
    
    let deleted = 0;
    let failed = 0;

    for (const backup of expiredBackups) {
      try {
        // Drop schema if exists
        const schemaExists = await this.tenantSchemaService.schemaExists(backup.schema_name);
        if (schemaExists) {
          await this.tenantSchemaService.dropTenantSchema(backup.schema_name);
        }

        // Delete backup record
        await this.tenantSchemaBackupsRepository.hardDelete(backup.id);
        
        deleted++;
        this.logger.log(`✓ Expired backup cleaned: ${backup.schema_name}`);
      } catch (error) {
        failed++;
        this.logger.error(`✗ Failed to cleanup backup ${backup.id}:`, error);
      }
    }

    this.logger.log(`✅ Cleanup complete: ${deleted} deleted, ${failed} failed`);

    return { deleted, failed };
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
    dto: { user_ids: number[]; default_role_id?: number; user_role_mapping?: Array<{ user_id: number; role_id: number }> },
    assignedBy: number,
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    this.logger.log(`Bulk adding ${dto.user_ids.length} users to tenant ${tenantId}`);

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
      const errors: any[] = [];

      // Get default role if not provided
      let defaultRoleId = dto.default_role_id;
      if (!defaultRoleId && !dto.user_role_mapping) {
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
        
        defaultRoleId = (roleResult.rows[0] as any).id;
      }

      // Process each user
      for (const userId of dto.user_ids) {
        try {
          // Find role for this user
          let roleId = defaultRoleId;
          if (dto.user_role_mapping) {
            const mapping = dto.user_role_mapping.find(m => m.user_id === userId);
            if (mapping) roleId = mapping.role_id;
          }

          if (!roleId) {
            throw new Error('Role ID required');
          }

          // Check if user already assigned
          const existingResult = await this.db.execute(sql`
            SELECT id FROM user_roles 
            WHERE user_id = ${userId} AND role_id = ${roleId}
          `);

          if (existingResult.rows.length > 0) {
            this.logger.warn(`User ${userId} sudah memiliki role di tenant ${tenantId}`);
            failedCount++;
            errors.push({
              user_id: userId,
              message: 'User already has this role in tenant',
            });
            continue;
          }

          // Insert user role
          await this.db.execute(sql`
            INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
            VALUES (${userId}, ${roleId}, ${assignedBy}, NOW())
          `);

          successCount++;
          this.logger.log(`✓ User ${userId} added to tenant ${tenantId}`);
        } catch (error: any) {
          this.logger.error(`Failed to add user ${userId}:`, error);
          failedCount++;
          errors.push({
            user_id: userId,
            message: error.message || 'Unknown error',
          });
        }
      }

      this.logger.log(
        `✅ Bulk add complete: ${successCount} success, ${failedCount} failed`,
      );

      return {
        success: successCount,
        failed: failedCount,
        errors,
      };
    } finally {
      // Reset search path
      await this.db.execute(sql.raw(`RESET search_path`));
    }
  }

  /**
   * Get users not in tenant (available to add)
   */
  async getAvailableUsers(tenantId: number, search?: string): Promise<any[]> {
    this.logger.log(`Getting available users for tenant ${tenantId}`);

    // Get tenant
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) {
      throw new ConflictException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant dengan ID ${tenantId} tidak ditemukan`,
      });
    }

    // Get users already in tenant
    const existingUsersResult = await this.db.execute(sql.raw(`
      SELECT DISTINCT user_id 
      FROM ${tenant.schema_name}.user_roles
    `));

    const existingUserIds = existingUsersResult.rows.map((row: any) => row.user_id);

    // Build query for available users
    let query = sql`
      SELECT id, email, name, created_at
      FROM public.users
      WHERE deleted_at IS NULL
    `;

    // Exclude users already in tenant
    if (existingUserIds.length > 0) {
      query = sql`
        SELECT id, email, name, created_at
        FROM public.users
        WHERE deleted_at IS NULL
        AND id NOT IN (${sql.join(existingUserIds.map(id => sql`${id}`), sql`, `)})
      `;
    }

    // Add search filter
    if (search) {
      query = sql`
        ${query}
        AND (
          email ILIKE ${`%${search}%`} OR
          name ILIKE ${`%${search}%`}
        )
      `;
    }

    query = sql`${query} ORDER BY name ASC LIMIT 100`;

    const result = await this.db.execute(query);

    this.logger.log(`✅ Found ${result.rows.length} available users`);

    return result.rows as any[];
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

    // Check if schema exists
    const schemaExistsResult = await this.db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = ${schemaName}
      ) as exists
    `);

    const schemaExists = (schemaExistsResult.rows[0] as any)?.exists;

    // If schema doesn't exist, return tenant with zero stats
    if (!schemaExists) {
      this.logger.warn(`Schema ${schemaName} does not exist yet. Returning zero stats.`);
      return {
        tenant: new TenantResponseDto(tenant),
        stats: {
          users: 0,
          roles: 0,
          permissions: 0,
          modules: 0,
          activity: 0,
        },
        provisioned: false,
      };
    }

    // Set search path to tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    try {
      let usersCount = 0;
      let rolesCount = 0;
      let permissionsCount = 0;
      let modulesCount = 0;
      let activityCount = 0;

      // Get users count (only active) - handle if table doesn't exist
      try {
        // Check if user_roles table exists
        const tableExistsResult = await this.db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = ${schemaName}
            AND table_name = 'user_roles'
          ) as exists
        `);

        if ((tableExistsResult.rows[0] as any)?.exists) {
          // Check if has deleted_at column
          const columnExistsResult = await this.db.execute(sql`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = ${schemaName}
              AND table_name = 'user_roles'
              AND column_name = 'deleted_at'
            ) as exists
          `);

          const hasSoftDelete = (columnExistsResult.rows[0] as any)?.exists;
          const whereClause = hasSoftDelete 
            ? sql`WHERE deleted_at IS NULL`
            : sql``;

          const usersResult = await this.db.execute(sql`
            SELECT COUNT(DISTINCT user_id) as count FROM user_roles ${whereClause}
          `);
          usersCount = Number((usersResult.rows[0] as any)?.count || 0);
        }
      } catch (error) {
        this.logger.warn(`Could not get users count for ${schemaName}: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Get roles count
      try {
        const rolesResult = await this.db.execute(sql`
          SELECT COUNT(*) as count FROM roles WHERE deleted_at IS NULL
        `);
        rolesCount = Number((rolesResult.rows[0] as any)?.count || 0);
      } catch (error) {
        this.logger.warn(`Could not get roles count for ${schemaName}`);
      }

      // Get permissions count
      try {
        const permissionsResult = await this.db.execute(sql`
          SELECT COUNT(*) as count FROM permissions
        `);
        permissionsCount = Number((permissionsResult.rows[0] as any)?.count || 0);
      } catch (error) {
        this.logger.warn(`Could not get permissions count for ${schemaName}`);
      }

      // Get modules count
      try {
        const modulesResult = await this.db.execute(sql`
          SELECT COUNT(*) as count FROM tenant_modules WHERE is_enabled = true
        `);
        modulesCount = Number((modulesResult.rows[0] as any)?.count || 0);
      } catch (error) {
        this.logger.warn(`Could not get modules count for ${schemaName}`);
      }

      // Get recent activity count (last 7 days)
      try {
        const activityResult = await this.db.execute(sql`
          SELECT COUNT(*) as count 
          FROM audit_logs 
          WHERE created_at >= NOW() - INTERVAL '7 days'
        `);
        activityCount = Number((activityResult.rows[0] as any)?.count || 0);
      } catch (error) {
        this.logger.warn(`Could not get activity count for ${schemaName}`);
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
        provisioned: true,
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
