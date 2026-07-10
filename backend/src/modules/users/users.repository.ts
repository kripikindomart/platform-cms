import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull } from 'drizzle-orm';
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { users, User } from '../../database/schema/tenant/users.schema';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @Inject('DRIZZLE')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly db: NodePgDatabase<any>,
    protected readonly tenantContext: TenantContextService,
  ) {
    super(db, users, tenantContext);
  }

  /**
   * Find user by email (exclude soft deleted)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(this.table)
        .where(and(eq(this.table.email, email), isNull(this.table.deleted_at)))
        .limit(1);

      return (results[0] as User) || null;
    });
  }

  /**
   * Update last login information
   */
  async updateLastLogin(id: number, ipAddress: string): Promise<void> {
    await this.withTenantSchema(() =>
      this.db
        .update(this.table)
        .set({
          last_login_at: new Date(),
          last_login_ip: ipAddress,
        })
        .where(eq(this.table.id, id)),
    );
  }

  /**
   * Update password
   */
  async updatePassword(
    id: number,
    passwordHash: string,
    userId: number,
  ): Promise<void> {
    await this.withTenantSchema(() =>
      this.db
        .update(this.table)
        .set({
          password_hash: passwordHash,
          password_changed_at: new Date(),
          updated_by: userId,
          updated_at: new Date(),
        })
        .where(eq(this.table.id, id)),
    );
  }
}
