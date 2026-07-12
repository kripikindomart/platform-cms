import { apiClient } from '../client';
import type { AuditLog, QueryAuditLogsDTO, PaginatedResponse } from '../types';

export const auditService = {
  async getAll(params?: QueryAuditLogsDTO): Promise<PaginatedResponse<AuditLog>> {
    return apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { 
      params: params as Record<string, unknown> 
    });
  },

  async getById(id: number): Promise<AuditLog> {
    return apiClient.get<AuditLog>(`/audit-logs/${id}`);
  },
};
