import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, or, like, sql } from 'drizzle-orm';
import { users, User } from '../../database/schema/public/users.schema';

/**
 * Users Repository - PUBLIC SCHEMA
 * Manages users in public.users table (shared across all tenants)
 * Does NOT use tenant context since users are global
 */
@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: NodePgDatabase<any>,
  ) {}

  /**
   * Find user by ID (exclude soft deleted)
   */
  async findById(id: number): Promise<User | null> {
    const results = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deleted_at)))
      .limit(1);

    return (results[0] as User) || null;
  }

  /**
   * Find user by email (exclude soft deleted)
   */
  async findByEmail(email: string): Promise<User | null> {
    const results = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deleted_at)))
      .limit(1);

    return (results[0] as User) || null;
  }

  /**
   * Create new user
   */
  async create(data: Partial<User>): Promise<User> {
    const insertData: any = {
      email: data.email,
      password_hash: data.password_hash,
      name: data.name,
      phone: data.phone,
      avatar_url: data.avatar_url,
      is_active: data.is_active ?? true,
      is_verified: data.is_verified ?? false,
      must_change_password: data.must_change_password ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Optional fields
    if (data.created_by !== undefined) insertData.created_by = data.created_by;
    if (data.updated_by !== undefined) insertData.updated_by = data.updated_by;
    if (data.last_login_at !== undefined) insertData.last_login_at = data.last_login_at;
    if (data.last_login_ip !== undefined) insertData.last_login_ip = data.last_login_ip;
    if (data.password_changed_at !== undefined) insertData.password_changed_at = data.password_changed_at;

    const results = await this.db
      .insert(users)
      .values(insertData)
      .returning();

    return results[0] as User;
  }

  /**
   * Update user
   */
  async update(id: number, data: Partial<User>): Promise<User | null> {
    const results = await this.db
      .update(users)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return (results[0] as User) || null;
  }

  /**
   * Soft delete user
   */
  async delete(id: number, deletedBy: number): Promise<void> {
    await this.db
      .update(users)
      .set({
        deleted_at: new Date(),
        deleted_by: deletedBy,
      })
      .where(eq(users.id, id));
  }

  /**
   * Hard delete user (permanent)
   */
  async hardDelete(id: number): Promise<void> {
    await this.db
      .delete(users)
      .where(eq(users.id, id));
  }

  /**
   * Update last login information
   */
  async updateLastLogin(id: number, ipAddress: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        last_login_at: new Date(),
        last_login_ip: ipAddress,
      })
      .where(eq(users.id, id));
  }

  /**
   * Update password
   */
  async updatePassword(
    id: number,
    passwordHash: string,
    userId: number,
  ): Promise<void> {
    await this.db
      .update(users)
      .set({
        password_hash: passwordHash,
        password_changed_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
      })
      .where(eq(users.id, id));
  }

  /**
   * Find all users (with pagination and search)
   */
  async findAll(params: {
    limit: number;
    offset: number;
    search?: string;
    includeDeleted?: boolean;
  }): Promise<{ data: User[]; total: number }> {
    const { limit, offset, search, includeDeleted = false } = params;
    
    // Build where clause
    const whereConditions: any[] = includeDeleted ? [] : [isNull(users.deleted_at)];
    
    if (search) {
      whereConditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`),
        )
      );
    }

    const whereClause = whereConditions.length > 1 
      ? and(...whereConditions)
      : whereConditions.length === 1 
        ? whereConditions[0]
        : undefined;

    // Get paginated results
    const query = this.db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(users.created_at);

    const results = whereClause 
      ? await query.where(whereClause)
      : await query;

    // Get total count
    const countQuery = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const countResults = whereClause
      ? await countQuery.where(whereClause)
      : await countQuery;

    const total: number = countResults[0]?.count || 0;

    return {
      data: results as User[],
      total,
    };
  }

  /**
   * Restore soft deleted user
   */
  async restore(id: number): Promise<void> {
    await this.db
      .update(users)
      .set({
        deleted_at: null,
        deleted_by: null,
        updated_at: new Date(),
      })
      .where(eq(users.id, id));
  }

  /**
   * Count total users
   */
  async count(): Promise<number> {
    const results = await this.db
      .select({ count: users.id })
      .from(users)
      .where(isNull(users.deleted_at));

    return results.length;
  }
}
