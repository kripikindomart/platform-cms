import { TenantResponseDto } from '../dto/tenant-response.dto';

/**
 * Tenant Provision Result Interface
 * Result dari tenant provisioning process
 */
export interface TenantProvisionResult {
  success: boolean;
  tenant: TenantResponseDto;
  schemaCreated: boolean;
  tablesCreated: number;
  rolesSeeded: number;
  permissionsSeeded: number;
  message: string;
}

/**
 * Tenant Provision Error Interface
 * Error details saat provisioning gagal
 */
export interface TenantProvisionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  rollbackPerformed: boolean;
}
