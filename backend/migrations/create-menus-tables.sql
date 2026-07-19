-- ================================================
-- Create Menus & Menu Items Tables
-- ================================================
-- Creates menu management tables in tenant schema
-- ================================================

CREATE TABLE IF NOT EXISTS tenant_demo_company.menus (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tenant_demo_company.menu_items (
  id BIGSERIAL PRIMARY KEY,
  menu_id BIGINT NOT NULL REFERENCES tenant_demo_company.menus(id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES tenant_demo_company.menu_items(id) ON DELETE CASCADE,
  module_name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  required_permission VARCHAR(100),
  metadata TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menus_slug ON tenant_demo_company.menus(slug);
CREATE INDEX IF NOT EXISTS idx_menus_order ON tenant_demo_company.menus("order");
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON tenant_demo_company.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON tenant_demo_company.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON tenant_demo_company.menu_items("order");

-- Verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'tenant_demo_company' 
  AND table_name IN ('menus', 'menu_items');
