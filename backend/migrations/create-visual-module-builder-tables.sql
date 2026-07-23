-- ================================================
-- Create Visual Module Builder Tables (PUBLIC)
-- ================================================
-- Tables untuk Visual Module Builder UI
-- DIFFERENT dari CLI generator (generated_modules)
-- ================================================

-- Table: visual_modules (metadata global)
CREATE TABLE IF NOT EXISTS public.visual_modules (
  id BIGSERIAL PRIMARY KEY,
  
  -- Module identification
  module_name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Module features
  is_tenant_isolated BOOLEAN NOT NULL DEFAULT true,
  has_soft_delete BOOLEAN NOT NULL DEFAULT true,
  has_audit BOOLEAN NOT NULL DEFAULT true,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
  
  -- Query configuration (array of field names)
  searchable_fields TEXT[],
  filterable_fields TEXT[],
  sortable_fields TEXT[],
  
  -- Statistics
  fields_count INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,
  
  -- UI/UX Configuration (JSON)
  ui_config TEXT NOT NULL DEFAULT '{"createFormType":"page","editFormType":"page"}',
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

-- Table: visual_module_fields
CREATE TABLE IF NOT EXISTS public.visual_module_fields (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES public.visual_modules(id) ON DELETE CASCADE,
  
  -- Field definition
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- string, text, number, boolean, date, datetime, email, url, uuid, json
  field_length INTEGER,
  precision INTEGER,
  scale INTEGER,
  
  -- Display configuration
  is_visible_in_list BOOLEAN NOT NULL DEFAULT true,
  
  -- Constraints
  default_value TEXT,
  
  -- Order
  field_order INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(module_id, field_name)
);

-- Table: visual_module_installations (tracking per tenant)
CREATE TABLE IF NOT EXISTS public.visual_module_installations (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES public.visual_modules(id) ON DELETE CASCADE,
  tenant_id BIGINT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Installation metadata
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Customizations (JSON)
  custom_config JSONB DEFAULT '{}'::jsonb,
  
  -- Audit
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  installed_by BIGINT NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique: one module per tenant
  UNIQUE(module_id, tenant_id)
);

-- Indexes for visual_modules
CREATE INDEX IF NOT EXISTS idx_visual_modules_name ON public.visual_modules(module_name);
CREATE INDEX IF NOT EXISTS idx_visual_modules_status ON public.visual_modules(status);
CREATE INDEX IF NOT EXISTS idx_visual_modules_created_by ON public.visual_modules(created_by);
CREATE INDEX IF NOT EXISTS idx_visual_modules_deleted_at ON public.visual_modules(deleted_at);

-- Indexes for visual_module_fields
CREATE INDEX IF NOT EXISTS idx_visual_fields_module_id ON public.visual_module_fields(module_id);
CREATE INDEX IF NOT EXISTS idx_visual_fields_order ON public.visual_module_fields(field_order);

-- Indexes for visual_module_installations
CREATE INDEX IF NOT EXISTS idx_visual_inst_module_id ON public.visual_module_installations(module_id);
CREATE INDEX IF NOT EXISTS idx_visual_inst_tenant_id ON public.visual_module_installations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visual_inst_enabled ON public.visual_module_installations(is_enabled);

-- Comments
COMMENT ON TABLE public.visual_modules IS 'Visual Module Builder - global module definitions';
COMMENT ON TABLE public.visual_module_fields IS 'Field definitions for visual modules';
COMMENT ON TABLE public.visual_module_installations IS 'Tracks which visual modules are installed in which tenants';

COMMENT ON COLUMN public.visual_modules.status IS 'draft (being built), published (ready to install), archived (deprecated)';
COMMENT ON COLUMN public.visual_modules.install_count IS 'Number of tenants that have installed this module';
COMMENT ON COLUMN public.visual_modules.ui_config IS 'UI/UX configuration (JSON) for form display type (modal or page)';

-- Verify creation
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('visual_modules', 'visual_module_fields', 'visual_module_installations')
ORDER BY table_name;
