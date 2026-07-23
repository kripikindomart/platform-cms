-- ================================================
-- Fix Visual Modules Table - Add ui_config Column
-- ================================================
-- This script is SAFE - can be run multiple times
-- ================================================

-- Step 1: Check if table exists, if not create it with ui_config included
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visual_modules') THEN
    
    -- Create table with ui_config from the start
    CREATE TABLE public.visual_modules (
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
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      
      -- Query configuration
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
      created_by BIGINT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by BIGINT,
      
      -- Soft delete
      deleted_at TIMESTAMPTZ,
      deleted_by BIGINT
    );
    
    RAISE NOTICE 'Created visual_modules table with ui_config column';
  ELSE
    RAISE NOTICE 'visual_modules table already exists';
  END IF;
END $$;

-- Step 2: Add ui_config column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'visual_modules' 
    AND column_name = 'ui_config'
  ) THEN
    ALTER TABLE public.visual_modules 
    ADD COLUMN ui_config TEXT NOT NULL DEFAULT '{"createFormType":"page","editFormType":"page"}';
    
    RAISE NOTICE 'Added ui_config column to visual_modules';
  ELSE
    RAISE NOTICE 'ui_config column already exists';
  END IF;
END $$;

-- Step 3: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_visual_modules_name ON public.visual_modules(module_name);
CREATE INDEX IF NOT EXISTS idx_visual_modules_status ON public.visual_modules(status);
CREATE INDEX IF NOT EXISTS idx_visual_modules_deleted_at ON public.visual_modules(deleted_at);

-- Step 4: Add comments
COMMENT ON TABLE public.visual_modules IS 'Visual Module Builder - global module definitions';
COMMENT ON COLUMN public.visual_modules.ui_config IS 'UI/UX configuration (JSON) for form display type (modal or page)';

-- Step 5: Create related tables if they don't exist
CREATE TABLE IF NOT EXISTS public.visual_module_fields (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL,
  
  -- Field definition
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.visual_module_installations (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL,
  tenant_id BIGINT NOT NULL,
  
  -- Installation metadata
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Customizations
  custom_config TEXT DEFAULT '{}',
  
  -- Audit
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  installed_by BIGINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique: one module per tenant
  UNIQUE(module_id, tenant_id)
);

-- Step 6: Create indexes for related tables
CREATE INDEX IF NOT EXISTS idx_visual_fields_module_id ON public.visual_module_fields(module_id);
CREATE INDEX IF NOT EXISTS idx_visual_fields_order ON public.visual_module_fields(field_order);
CREATE INDEX IF NOT EXISTS idx_visual_inst_module_id ON public.visual_module_installations(module_id);
CREATE INDEX IF NOT EXISTS idx_visual_inst_tenant_id ON public.visual_module_installations(tenant_id);

-- Verification
SELECT 
  'visual_modules' as table_name,
  EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visual_modules') as exists,
  EXISTS(SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visual_modules' AND column_name = 'ui_config') as has_ui_config
UNION ALL
SELECT 
  'visual_module_fields',
  EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visual_module_fields'),
  NULL
UNION ALL
SELECT 
  'visual_module_installations',
  EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visual_module_installations'),
  NULL;
