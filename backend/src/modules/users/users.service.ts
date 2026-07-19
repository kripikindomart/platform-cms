import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RolesRepository } from '../roles/roles.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../../database/schema/public/users.schema';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { UserTenantsResponseDto, TenantAccessDto } from './dto/user-tenants-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly tenantContext: TenantContextService,
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<any>,
  ) {}

  /**
   * Create new user
   */
  async create(dto: CreateUserDto, createdBy?: number): Promise<User> {
    return this.usersRepository.create({
      ...dto,
      created_by: createdBy,
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  /**
   * Find user by ID with roles and permissions (for CASL)
   */
  async findByIdWithRoles(id: number): Promise<User | null> {
    const user = await this.usersRepository.findById(id);
    
    if (!user) {
      return null;
    }

    // Check if tenant context is set
    if (!this.tenantContext.hasTenant()) {
      throw new Error('Tenant context not set when loading user roles');
    }

    // Load user roles with permissions
    const roles = await this.rolesRepository.getUserRolesWithPermissions(id);

    // Attach roles to user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any).roles = roles;

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Update last login information
   */
  async updateLastLogin(userId: number, ipAddress: string): Promise<void> {
    await this.usersRepository.updateLastLogin(userId, ipAddress);
  }

  /**
   * Update user password
   */
  async updatePassword(
    userId: number,
    passwordHash: string,
    updatedBy: number,
  ): Promise<void> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan',
      });
    }

    await this.usersRepository.updatePassword(userId, passwordHash, updatedBy);
  }

  /**
   * Find all users with pagination and tenant info
   */
  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    includeDeleted?: boolean;
  }) {
    const { page, limit, search, includeDeleted = false } = params;
    const offset = (page - 1) * limit;

    const { data, total } = await this.usersRepository.findAll({
      limit,
      offset,
      search,
      includeDeleted,
    });

    const totalPages = Math.ceil(total / limit);

    // Get current tenant schema to find user roles in this tenant
    const schemaName = this.tenantContext.getSchemaName();
    
    // Enrich users with tenant role information from current tenant
    const enrichedUsers = await Promise.all(
      data.map(async (user) => {
        try {
          // Query user roles in current tenant
          const rolesResult = await this.db.execute(
            sql.raw(`
              SELECT r.name, r.display_name 
              FROM ${schemaName}.user_roles ur
              JOIN ${schemaName}.roles r ON ur.role_id = r.id
              WHERE ur.user_id = ${user.id}
              AND ur.deleted_at IS NULL
              LIMIT 3
            `)
          );

          const roles = (rolesResult.rows as any[]).map(r => r.display_name || r.name);
          
          // Get all tenants this user has access to
          const tenantsData = await this.getUserTenants(user.id);
          
          return {
            ...user,
            roles: roles.length > 0 ? roles : ['No Role'],
            role_count: roles.length,
            tenants: tenantsData.tenants || [],
          };
        } catch (error) {
          // If user has no roles in this tenant, return with empty roles
          try {
            const tenantsData = await this.getUserTenants(user.id);
            return {
              ...user,
              roles: ['No Role'],
              role_count: 0,
              tenants: tenantsData.tenants || [],
            };
          } catch {
            return {
              ...user,
              roles: ['No Role'],
              role_count: 0,
              tenants: [],
            };
          }
        }
      })
    );

    return {
      data: enrichedUsers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Activate user
   */
  async activate(userId: number, updatedBy: number): Promise<void> {
    await this.usersRepository.update(userId, {
      is_active: true,
      updated_by: updatedBy,
    });
  }

  /**
   * Deactivate user
   */
  async deactivate(userId: number, updatedBy: number): Promise<void> {
    await this.usersRepository.update(userId, {
      is_active: false,
      updated_by: updatedBy,
    });
  }

  /**
   * Soft delete user
   */
  async softDelete(userId: number, deletedBy: number): Promise<void> {
    await this.usersRepository.delete(userId, deletedBy);
  }

  /**
   * Hard delete user (permanent)
   */
  async hardDelete(userId: number): Promise<void> {
    await this.usersRepository.hardDelete(userId);
  }

  /**
   * Bulk activate users
   */
  async bulkActivate(userIds: number[], updatedBy: number): Promise<void> {
    await Promise.all(
      userIds.map(id => this.activate(id, updatedBy))
    );
  }

  /**
   * Bulk deactivate users
   */
  async bulkDeactivate(userIds: number[], updatedBy: number): Promise<void> {
    await Promise.all(
      userIds.map(id => this.deactivate(id, updatedBy))
    );
  }

  /**
   * Bulk soft delete users
   */
  async bulkSoftDelete(userIds: number[], deletedBy: number): Promise<void> {
    await Promise.all(
      userIds.map(id => this.softDelete(id, deletedBy))
    );
  }

  /**
   * Restore soft deleted user
   */
  async restore(userId: number): Promise<void> {
    await this.usersRepository.restore(userId);
  }

  /**
   * Bulk restore users
   */
  async bulkRestore(userIds: number[]): Promise<void> {
    await Promise.all(
      userIds.map(id => this.restore(id))
    );
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Get all tenants that user has access to
   */
  async getUserTenants(userId: number): Promise<UserTenantsResponseDto> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan',
      });
    }

    // Query all tenants where user has roles
    // This queries across ALL tenant schemas
    const query = sql`
      SELECT 
        t.id,
        t.slug,
        t.name,
        t.logo_url,
        t.is_active,
        r.name as role_name,
        r.display_name as role_display_name,
        ur.assigned_at as user_role_assigned_at
      FROM public.tenants t
      CROSS JOIN LATERAL (
        SELECT 
          ur.assigned_at,
          r.id as role_id,
          r.name,
          r.display_name
        FROM information_schema.tables ist
        CROSS JOIN LATERAL (
          SELECT * FROM (
            SELECT 
              ur.assigned_at,
              r.id,
              r.name,
              r.display_name
            FROM pg_catalog.pg_namespace n
            CROSS JOIN LATERAL (
              EXECUTE format(
                'SELECT ur.assigned_at, r.id, r.name, r.display_name 
                 FROM %I.user_roles ur 
                 JOIN %I.roles r ON ur.role_id = r.id 
                 WHERE ur.user_id = $1 
                 LIMIT 1',
                n.nspname, n.nspname
              ) USING ${userId}
            ) sub
            WHERE n.nspname = 'tenant_' || t.slug
            LIMIT 1
          ) x
        ) ur
        WHERE ist.table_schema = 'tenant_' || t.slug
          AND ist.table_name = 'user_roles'
        LIMIT 1
      ) ur, 
      LATERAL (
        SELECT id, name, display_name 
        FROM pg_catalog.pg_namespace n
        CROSS JOIN LATERAL (
          EXECUTE format(
            'SELECT id, name, display_name FROM %I.roles WHERE id = $1',
            n.nspname
          ) USING ur.role_id
        ) r
        WHERE n.nspname = 'tenant_' || t.slug
      ) r
      WHERE t.is_active = true
      ORDER BY ur.assigned_at DESC
    `;

    // Simplified: Query each known tenant schema manually
    // This is more reliable than dynamic SQL
    const tenants: TenantAccessDto[] = [];
    
    // Get all active tenants from public
    const tenantsResult = await this.db.execute(sql`
      SELECT id, slug, name, is_active 
      FROM public.tenants 
      WHERE is_active = true
      ORDER BY created_at ASC
    `);
    
    for (const tenant of tenantsResult.rows as any[]) {
      try {
        const schemaName = `tenant_${tenant.slug}`;
        
        // Check if user has role in this tenant
        const userRoleResult = await this.db.execute(sql`
          SELECT 
            ur.assigned_at,
            r.name as role_name,
            r.display_name as role_display_name
          FROM ${sql.raw(`"${schemaName}".user_roles`)} ur
          JOIN ${sql.raw(`"${schemaName}".roles`)} r ON ur.role_id = r.id
          WHERE ur.user_id = ${userId}
          LIMIT 1
        `);
        
        if (userRoleResult.rows.length > 0) {
          const roleInfo = userRoleResult.rows[0] as any;
          
          tenants.push({
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.name,
            logo_url: null, // No logo_url in schema yet
            is_active: tenant.is_active,
            role_name: roleInfo.role_name,
            role_display_name: roleInfo.role_display_name,
            user_role_assigned_at: roleInfo.assigned_at,
          });
        }
      } catch (error) {
        // Tenant schema might not exist, skip silently
      }
    }

    // Determine default tenant (first one or most recently assigned)
    const defaultTenant = tenants.length > 0 ? tenants[0].slug : null;

    return {
      user_id: userId,
      user_email: user.email,
      tenants,
      default_tenant: defaultTenant,
    };
  }
}
