export interface QueryAuditLogDto {
  user_id?: number;
  resource?: string;
  resource_id?: number;
  action?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}
