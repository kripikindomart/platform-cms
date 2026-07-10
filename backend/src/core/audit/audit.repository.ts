import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import * as tenantSchema from '@/database/schema/tenant';
import { TenantContextService } from '@/common/context/tenant-context.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  resource: string;
  resource_id: number | null;
  description: string | null;
  old_values: string | null;
  new_values: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

@Injectable()
export class AuditRepository {
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
   * Create audit log entry
   * Note: Audit logs are immutable (no update/delete)
   */
  async create(dto: CreateAuditLogDto): Promise<void> {
    await this.withTenantSchema(async () => {
      await this.db.insert(tenantSchema.auditLogs).values({
        user_id: dto.user_id || null,
        action: dto.action,
        resource: dto.resource,
        resource_id: dto.resource_id || null,
        description: dto.description || null,
        old_values: dto.old_values || null,
        new_values: dto.new_values || null,
        ip_address: dto.ip_address || null,
        user_agent: dto.user_agent || null,
        created_at: new Date(),
      });
    });
  }

  /**
   * Query audit logs with filters
   */
  async findAll(query: QueryAuditLogDto): Promise<AuditLog[]> {
    return this.withTenantSchema(async () => {
      const conditions = [];

      if (query.user_id) {
        conditions.push(eq(tenantSchema.auditLogs.user_id, query.user_id));
      }

      if (query.resource) {
        conditions.push(eq(tenantSchema.auditLogs.resource, query.resource));
      }

      if (query.resource_id) {
        conditions.push(eq(tenantSchema.auditLogs.resource_id, query.resource_id));
      }

      if (query.action) {
        conditions.push(eq(tenantSchema.auditLogs.action, query.action));
      }

      if (query.start_date) {
        conditions.push(gte(tenantSchema.auditLogs.created_at, query.start_date));
      }

      if (query.end_date) {
        conditions.push(lte(tenantSchema.auditLogs.created_at, query.end_date));
      }

      const results = await this.db
        .select()
        .from(tenantSchema.auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(tenantSchema.auditLogs.created_at))
        .limit(query.limit || 100)
        .offset(query.offset || 0);

      return results as AuditLog[];
    });
  }

  /**
   * Get user's audit trail
   */
  async findByUser(userId: number, limit = 100): Promise<AuditLog[]> {
    return this.findAll({ user_id: userId, limit });
  }

  /**
   * Get resource's audit trail
   */
  async findByResource(resource: string, resourceId: number, limit = 100): Promise<AuditLog[]> {
    return this.findAll({ resource, resource_id: resourceId, limit });
  }

  /**
   * Get logs by action type
   */
  async findByAction(action: string, limit = 100): Promise<AuditLog[]> {
    return this.findAll({ action, limit });
  }

  /**
   * Count audit logs with filters
   */
  async count(query: QueryAuditLogDto): Promise<number> {
    return this.withTenantSchema(async () => {
      const conditions = [];

      if (query.user_id) {
        conditions.push(eq(tenantSchema.auditLogs.user_id, query.user_id));
      }

      if (query.resource) {
        conditions.push(eq(tenantSchema.auditLogs.resource, query.resource));
      }

      if (query.action) {
        conditions.push(eq(tenantSchema.auditLogs.action, query.action));
      }

      const results = await this.db
        .select()
        .from(tenantSchema.auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return results.length;
    });
  }
}
