import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, isNull, sql, and } from 'drizzle-orm';
import * as publicSchema from '../../database/schema/public';
import { tenants, NewTenant, Tenant } from '../../database/schema/public';

@Injectable()
export class TenantsRepository {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: NodePgDatabase<typeof publicSchema>,
  ) {}

  /**
   * Create new tenant
   */
  async create(data: NewTenant): Promise<Tenant> {
    const [tenant] = await this.db.insert(tenants).values(data).returning();
    return tenant;
  }

  /**
   * Find tenant by ID
   */
  async findById(id: number, includeDeleted: boolean = false): Promise<Tenant | undefined> {
    const conditions = [eq(tenants.id, id)];
    
    if (!includeDeleted) {
      conditions.push(isNull(tenants.deleted_at));
    }

    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(and(...conditions));

    return tenant;
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, slug), isNull(tenants.deleted_at)));

    return tenant;
  }

  /**
   * Find all tenants
   */
  async findAll(): Promise<Tenant[]> {
    return this.db
      .select()
      .from(tenants)
      .where(isNull(tenants.deleted_at))
      .orderBy(tenants.created_at);
  }

  /**
   * Find all tenants with pagination, filtering, sorting
   */
  async findAllPaginated(options: {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    is_active?: boolean;
    subscription_tier?: string;
    includeDeleted?: boolean;
  }): Promise<{ data: Tenant[]; meta: any }> {
    const { page, limit, sort = 'created_at', order = 'asc', search, is_active, subscription_tier, includeDeleted = false } = options;
    
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (!includeDeleted) {
      conditions.push(isNull(tenants.deleted_at));
    }
    
    if (search) {
      conditions.push(
        sql`(${tenants.name} ILIKE ${'%' + search + '%'} OR ${tenants.slug} ILIKE ${'%' + search + '%'})`
      );
    }
    
    if (is_active !== undefined) {
      conditions.push(eq(tenants.is_active, is_active));
    }
    
    if (subscription_tier) {
      conditions.push(eq(tenants.subscription_tier, subscription_tier));
    }

    // Build order by
    const orderByColumn = (tenants as any)[sort] || tenants.created_at;
    const orderDirection = order === 'desc' ? sql`DESC` : sql`ASC`;

    // Execute query with pagination
    const data = await this.db
      .select()
      .from(tenants)
      .where(and(...conditions))
      .orderBy(sql`${orderByColumn} ${orderDirection}`)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenants)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update tenant
   */
  async update(id: number, data: Partial<NewTenant>): Promise<Tenant> {
    const [tenant] = await this.db
      .update(tenants)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(tenants.id, id))
      .returning();

    return tenant;
  }

  /**
   * Soft delete tenant
   */
  async softDelete(id: number, deletedBy?: number): Promise<void> {
    await this.db
      .update(tenants)
      .set({
        deleted_at: new Date(),
        deleted_by: deletedBy,
      })
      .where(eq(tenants.id, id));
  }

  /**
   * Hard delete tenant (untuk rollback)
   */
  async hardDelete(id: number): Promise<void> {
    await this.db.delete(tenants).where(eq(tenants.id, id));
  }

  /**
   * Restore soft deleted tenant
   */
  async restore(id: number): Promise<Tenant> {
    const [tenant] = await this.db
      .update(tenants)
      .set({
        deleted_at: null,
        deleted_by: null,
      })
      .where(eq(tenants.id, id))
      .returning();

    return tenant;
  }

  /**
   * Count tenants
   */
  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenants)
      .where(isNull(tenants.deleted_at));

    return result[0]?.count || 0;
  }
}
