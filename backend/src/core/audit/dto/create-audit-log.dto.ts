export interface CreateAuditLogDto {
  user_id?: number | null;
  action: string;
  resource: string;
  resource_id?: number | null;
  description?: string;
  old_values?: string | null; // JSON string
  new_values?: string | null; // JSON string
  ip_address?: string;
  user_agent?: string;
}
