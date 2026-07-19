import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql, and, gte, isNull, desc, eq } from 'drizzle-orm';
import * as tenantSchema from '../../database/schema/tenant';
import * as publicSchema from '../../database/schema/public';
import { TenantContextService } from '../../common/context/tenant-context.service';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof tenantSchema & typeof publicSchema>,
    private tenantContext: TenantContextService,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getStats(user: any) {
    const tenantId = this.tenantContext.getTenantId();
    
    // Get counts from database
    const [userCount, roleCount, permissionCount] = await Promise.all([
      this.getUserCount(),
      this.getRoleCount(),
      this.getPermissionCount(),
    ]);

    // Calculate growth (mock for now - would need historical data)
    const userGrowth = 12.5;
    const roleGrowth = 3;
    const permissionGrowth = 24;

    // Get tenant count (public schema for super admin)
    let tenantCount = 0;
    let tenantGrowth = 0;
    
    try {
      const result = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(publicSchema.tenants)
        .where(isNull(publicSchema.tenants.deleted_at));
      
      tenantCount = Number(result[0]?.count || 0);
      tenantGrowth = 8.2;
    } catch (error) {
      // User might not have access to public schema
      tenantCount = 1;
    }

    return {
      totalUsers: userCount,
      activeTenants: tenantCount,
      totalRoles: roleCount,
      totalPermissions: permissionCount,
      userGrowth,
      tenantGrowth,
      roleGrowth,
      permissionGrowth,
    };
  }

  /**
   * Get recent activity from audit logs
   */
  async getRecentActivity(user: any, limit: number = 10) {
    try {
      // Query audit logs
      const logs = await this.db
        .select({
          id: tenantSchema.auditLogs.id,
          action: tenantSchema.auditLogs.action,
          resource: tenantSchema.auditLogs.resource,
          resourceId: tenantSchema.auditLogs.resource_id,
          userId: tenantSchema.auditLogs.user_id,
          timestamp: tenantSchema.auditLogs.created_at,
        })
        .from(tenantSchema.auditLogs)
        .orderBy(desc(tenantSchema.auditLogs.created_at))
        .limit(limit);

      // Map to activity format
      return logs.map((log) => ({
        id: log.id,
        action: this.formatAction(log.action, log.resource),
        user: 'User', // TODO: Join with users table
        userId: log.userId,
        time: this.formatTimeAgo(log.timestamp),
        timestamp: log.timestamp.toISOString(),
        status: this.getStatusFromAction(log.action),
        resource: log.resource,
        resourceId: log.resourceId,
      }));
    } catch (error) {
      // Return mock data if audit logs not available
      return this.getMockActivity(limit);
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    // Check database connection
    let databaseStatus: 'up' | 'down' = 'up';
    try {
      await this.db.execute(sql`SELECT 1`);
    } catch {
      databaseStatus = 'down';
    }

    // Mock Redis status (would need actual Redis check)
    const redisStatus: 'up' | 'down' = 'up';

    const status = databaseStatus === 'up' && redisStatus === 'up' ? 'operational' : 'degraded';

    return {
      status,
      uptime: 99.9,
      uptimePercentage: '99.9%',
      lastChecked: new Date().toISOString(),
      services: {
        database: databaseStatus,
        redis: redisStatus,
        api: 'up' as const,
      },
    };
  }

  /**
   * Get user growth data (last N days)
   */
  async getUserGrowth(user: any, days: number = 7) {
    // Mock data for now
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      data.push(Math.floor(Math.random() * 50) + 20);
    }

    return { labels, data };
  }

  /**
   * Get tenant distribution
   */
  async getTenantDistribution(user: any) {
    // Mock data
    return {
      active: 45,
      inactive: 3,
      suspended: 0,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async getUserCount(): Promise<number> {
    try {
      const result = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(publicSchema.users)
        .where(isNull(publicSchema.users.deleted_at));

      return Number(result[0]?.count || 0);
    } catch {
      return 0;
    }
  }

  private async getRoleCount(): Promise<number> {
    try {
      const result = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tenantSchema.roles)
        .where(isNull(tenantSchema.roles.deleted_at));

      return Number(result[0]?.count || 0);
    } catch {
      return 0;
    }
  }

  private async getPermissionCount(): Promise<number> {
    try {
      const result = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tenantSchema.permissions);

      return Number(result[0]?.count || 0);
    } catch {
      return 0;
    }
  }

  private formatAction(action: string, resource: string): string {
    const actionMap: Record<string, string> = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      restore: 'restored',
    };

    const actionText = actionMap[action] || action;
    return `${resource} ${actionText}`;
  }

  private formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  private getStatusFromAction(action: string): 'success' | 'warning' | 'error' | 'info' {
    if (action === 'delete') return 'warning';
    if (action === 'create') return 'success';
    return 'info';
  }

  private getMockActivity(limit: number) {
    const activities = [
      {
        id: 1,
        action: 'New user registered',
        user: 'John Doe',
        time: '2 minutes ago',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        status: 'success' as const,
      },
      {
        id: 2,
        action: 'Role permissions updated',
        user: 'Admin',
        time: '15 minutes ago',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'success' as const,
      },
      {
        id: 3,
        action: 'Failed login attempt',
        user: 'Unknown',
        time: '1 hour ago',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        status: 'warning' as const,
      },
      {
        id: 4,
        action: 'New tenant created',
        user: 'Sarah Smith',
        time: '3 hours ago',
        timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
        status: 'success' as const,
      },
    ];

    return activities.slice(0, limit);
  }
}
