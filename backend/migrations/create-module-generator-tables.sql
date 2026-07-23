-- ================================================
-- Create Module Generator Tables
-- ================================================
-- Creates tables untuk menyimpan metadata module
-- yang di-generate melalui Visual CRUD Builder UI
-- ================================================

-- Table 1: generated_modules
-- Stores metadata untuk setiap generated module
CREATE TABLE IF NOT EXISTS generated_modules (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  
  -- Module identification
  module_name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Module features
  is_tenant_isolated BOOLEAN NOT NULL DEFAULT true,
  has_soft_delete BOOLEAN NOT NULL DEFAULT true,
  has_audit BOOLEAN NOT NULL DEFAULT true,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private', -- future: public for marketplace
  
  -- Query configuration (array of field names)
  searchable_fields TEXT[],
  filterable_fields TEXT[],
  sortable_fields TEXT[],
  
  -- Statistics
  fields_count INTEGER NOT NULL DEFAULT 0,
  permissions_count INTEGER NOT NULL DEFAULT 0,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for generated_modules
CREATE INDEX IF NOT EXISTS idx_generated_modules_tenant_id ON generated_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generated_modules_module_name ON generated_modules(module_name);
CREATE INDEX IF NOT EXISTS idx_generated_modules_created_by ON generated_modules(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_modules_deleted_at ON generated_modules(deleted_at);

-- Table 2: generated_module_fields
-- Stores field definitions untuk setiap module
CREATE TABLE IF NOT EXISTS generated_module_fields (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES generated_modules(id) ON DELETE CASCADE,
  
  -- Field definition
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- string, text, integer, decimal, boolean, date, datetime, email, url, uuid, json, enum
  field_length INTEGER, -- for string/varchar
  precision INTEGER, -- for decimal
  scale INTEGER, -- for decimal
  
  -- Constraints
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_unique BOOLEAN NOT NULL DEFAULT false,
  default_value TEXT,
  
  -- Validations (JSON array)
  -- Example: [{"type": "min", "value": 3}, {"type": "email"}]
  validations JSONB DEFAULT '[]'::jsonb,
  
  -- Order
  field_order INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one field name per module
  UNIQUE(module_id, field_name)
);

-- Indexes for generated_module_fields
CREATE INDEX IF NOT EXISTS idx_generated_module_fields_module_id ON generated_module_fields(module_id);
CREATE INDEX IF NOT EXISTS idx_generated_module_fields_field_order ON generated_module_fields(field_order);

-- Comments for documentation
COMMENT ON TABLE generated_modules IS 'Metadata untuk module yang di-generate via CRUD Builder UI';
COMMENT ON TABLE generated_module_fields IS 'Field definitions untuk setiap generated module';

COMMENT ON COLUMN generated_modules.visibility IS 'private (default) atau public untuk future marketplace feature';
COMMENT ON COLUMN generated_modules.searchable_fields IS 'Array of field names yang support full-text search';
COMMENT ON COLUMN generated_modules.filterable_fields IS 'Array of field names yang support filtering';
COMMENT ON COLUMN generated_modules.sortable_fields IS 'Array of field names yang support sorting';

COMMENT ON COLUMN generated_module_fields.validations IS 'JSON array of validation rules, e.g., [{"type": "min", "value": 3}]';
COMMENT ON COLUMN generated_module_fields.field_order IS 'Display order dalam form dan table';

-- Verify tables created
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = current_schema()
  AND table_name IN ('generated_modules', 'generated_module_fields');
