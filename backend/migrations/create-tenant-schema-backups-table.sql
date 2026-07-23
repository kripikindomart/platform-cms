-- Migration: Create tenant_schema_backups table
-- Description: Track schema backups for permanently deleted tenants (15-day retention)
-- Created: 2024

-- Create tenant_schema_backups table
CREATE TABLE IF NOT EXISTS public.tenant_schema_backups (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  tenant_slug VARCHAR(255) NOT NULL,
  schema_name VARCHAR(255) NOT NULL UNIQUE,
  backup_reason VARCHAR(100) DEFAULT 'tenant_hard_delete',
  backup_size VARCHAR(50),
  table_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Auto-delete after 15 days
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  restored_at TIMESTAMP WITH TIME ZONE,
  restored_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_schema_backups_tenant_id ON public.tenant_schema_backups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_schema_backups_schema_name ON public.tenant_schema_backups(schema_name);
CREATE INDEX IF NOT EXISTS idx_tenant_schema_backups_expires_at ON public.tenant_schema_backups(expires_at);
CREATE INDEX IF NOT EXISTS idx_tenant_schema_backups_deleted_at ON public.tenant_schema_backups(deleted_at);

-- Comment
COMMENT ON TABLE public.tenant_schema_backups IS 'Tracks schema backups for permanently deleted tenants with 15-day retention policy';
COMMENT ON COLUMN public.tenant_schema_backups.expires_at IS 'Schema will be auto-deleted after this date (15 days from backup)';
COMMENT ON COLUMN public.tenant_schema_backups.backup_reason IS 'Reason for backup: tenant_hard_delete, manual_backup, etc';
