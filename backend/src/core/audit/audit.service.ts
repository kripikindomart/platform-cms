import { Injectable } from '@nestjs/common';
import { AuditRepository, AuditLog } from './audit.repository';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  /**
   * Create audit log entry
   * This is the main method untuk log any action
   */
  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.auditRepository.create(dto);
    } catch (error) {
      // Don't throw error - audit logging should never break the main flow
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Query audit logs with filters
   */
  async findAll(query: QueryAuditLogDto = {}): Promise<AuditLog[]> {
    return this.auditRepository.findAll(query);
  }

  /**
   * Get user's audit trail
   */
  async findByUser(userId: number, limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.findByUser(userId, limit);
  }

  /**
   * Get resource's audit trail
   */
  async findByResource(resource: string, resourceId: number, limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.findByResource(resource, resourceId, limit);
  }

  /**
   * Get logs by action type
   */
  async findByAction(action: string, limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.findByAction(action, limit);
  }

  /**
   * Count audit logs with filters
   */
  async count(query: QueryAuditLogDto = {}): Promise<number> {
    return this.auditRepository.count(query);
  }

  /**
   * Helper: Log authentication event
   */
  async logAuth(params: {
    userId?: number;
    action: 'register' | 'login' | 'logout' | 'password_change' | 'login_failed';
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
  }): Promise<void> {
    await this.log({
      user_id: params.userId,
      action: params.action,
      resource: 'auth',
      resource_id: params.userId,
      description: params.description || `User ${params.action}`,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    });
  }

  /**
   * Helper: Log CRUD operation
   */
  async logCrud(params: {
    userId?: number;
    action: 'create' | 'update' | 'delete' | 'restore';
    resource: string;
    resourceId?: number;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      user_id: params.userId,
      action: params.action,
      resource: params.resource,
      resource_id: params.resourceId,
      description: `${params.action} ${params.resource}`,
      old_values: params.oldValues ? JSON.stringify(params.oldValues) : null,
      new_values: params.newValues ? JSON.stringify(params.newValues) : null,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    });
  }

  /**
   * Helper: Log permission change
   */
  async logPermission(params: {
    userId?: number;
    action: 'role_assign' | 'role_remove' | 'permission_grant' | 'permission_revoke';
    targetUserId?: number;
    roleId?: number;
    permissionId?: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      user_id: params.userId,
      action: params.action,
      resource: 'permissions',
      resource_id: params.targetUserId || params.roleId || params.permissionId,
      description: `${params.action} for user/role`,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    });
  }
}
