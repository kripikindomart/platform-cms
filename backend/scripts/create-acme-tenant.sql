-- ================================================
-- Create Acme Corp Tenant
-- ================================================
-- Full tenant setup with schema, tables, and user assignment
-- ================================================

-- 1. Create tenant record
INSERT INTO public.tenants (name, slug, domain, schema_name, subscription_tier, config, is_active, created_at, updated_at) 
VALUES ('Acme Corp', 'acme', 'acme.example.com', 'tenant_acme', 'professional', NULL, true, NOW(), NOW())
RETURNING id, slug, schema_name;

-- 2. Create tenant schema
CREATE SCHEMA IF NOT EXISTS tenant_acme;

-- 3. Create roles table
CREATE TABLE tenant_acme.roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_acme_roles_name ON tenant_acme.roles(name);
CREATE INDEX idx_acme_roles_is_active ON tenant_acme.roles(is_active);
CREATE INDEX idx_acme_roles_deleted_at ON tenant_acme.roles(deleted_at);

-- 4. Create permissions table
CREATE TABLE tenant_acme.permissions (
  id BIGSERIAL PRIMARY KEY,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(resource, action, scope)
);

CREATE INDEX idx_acme_permissions_resource ON tenant_acme.permissions(resource);

-- 5. Create user_roles table
CREATE TABLE tenant_acme.user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES tenant_acme.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_acme_user_roles_user_id ON tenant_acme.user_roles(user_id);
CREATE INDEX idx_acme_user_roles_role_id ON tenant_acme.user_roles(role_id);

-- 6. Create role_permissions table
CREATE TABLE tenant_acme.role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES tenant_acme.roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES tenant_acme.permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_acme_role_permissions_role_id ON tenant_acme.role_permissions(role_id);

-- 7. Create sessions table
CREATE TABLE tenant_acme.sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_acme_sessions_token_hash ON tenant_acme.sessions(token_hash);
CREATE INDEX idx_acme_sessions_user_id ON tenant_acme.sessions(user_id);

-- 8. Create audit_logs table
CREATE TABLE tenant_acme.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT,
  changes TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_acme_audit_logs_user_id ON tenant_acme.audit_logs(user_id);
CREATE INDEX idx_acme_audit_logs_entity ON tenant_acme.audit_logs(entity_type, entity_id);

-- 9. Create password_resets table
CREATE TABLE tenant_acme.password_resets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_acme_password_resets_token_hash ON tenant_acme.password_resets(token_hash);

-- 10. Create categories table
CREATE TABLE tenant_acme.categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id BIGINT REFERENCES tenant_acme.categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_acme_categories_slug ON tenant_acme.categories(slug);

-- 11. Create tags table
CREATE TABLE tenant_acme.tags (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_acme_tags_name ON tenant_acme.tags(name);
CREATE UNIQUE INDEX idx_acme_tags_slug ON tenant_acme.tags(slug);

-- 12. Create tenant_modules table
CREATE TABLE tenant_acme.tenant_modules (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  module_id BIGINT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config TEXT,
  enabled_at TIMESTAMPTZ,
  enabled_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  disabled_at TIMESTAMPTZ,
  disabled_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, module_id)
);

CREATE INDEX idx_acme_tenant_modules_tenant_id ON tenant_acme.tenant_modules(tenant_id);

-- 13. Create menus table
CREATE TABLE tenant_acme.menus (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_acme_menus_slug ON tenant_acme.menus(slug);
CREATE INDEX idx_acme_menus_order ON tenant_acme.menus("order");

-- 14. Create menu_items table
CREATE TABLE tenant_acme.menu_items (
  id BIGSERIAL PRIMARY KEY,
  menu_id BIGINT NOT NULL REFERENCES tenant_acme.menus(id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES tenant_acme.menu_items(id) ON DELETE CASCADE,
  module_name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  required_permission VARCHAR(100),
  metadata TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_acme_menu_items_menu_id ON tenant_acme.menu_items(menu_id);
CREATE INDEX idx_acme_menu_items_order ON tenant_acme.menu_items("order");

-- ================================================
-- SEED DATA
-- ================================================

-- Seed roles
INSERT INTO tenant_acme.roles (name, display_name, description, is_system, is_active) VALUES
('superadmin', 'Super Administrator', 'Full system access', true, true),
('admin', 'Administrator', 'Administrative access', true, true),
('editor', 'Editor', 'Content editing access', false, true),
('viewer', 'Viewer', 'Read-only access', false, true);

-- Seed permissions
INSERT INTO tenant_acme.permissions (resource, action, scope, description) VALUES
('users', 'create', 'tenant', 'Create users'),
('users', 'read', 'tenant', 'View all users'),
('users', 'update', 'tenant', 'Update any user'),
('users', 'delete', 'tenant', 'Delete users'),
('users', 'read', 'own', 'View own profile'),
('users', 'update', 'own', 'Update own profile'),
('roles', 'create', 'tenant', 'Create roles'),
('roles', 'read', 'tenant', 'View roles'),
('roles', 'update', 'tenant', 'Update roles'),
('roles', 'delete', 'tenant', 'Delete roles'),
('categories', 'create', 'tenant', 'Create categories'),
('categories', 'read', 'tenant', 'View categories'),
('categories', 'update', 'tenant', 'Update categories'),
('categories', 'delete', 'tenant', 'Delete categories');

-- Assign superadmin user (ID 7 from public.users) to Acme tenant
INSERT INTO tenant_acme.user_roles (user_id, role_id) 
SELECT 7, id FROM tenant_acme.roles WHERE name = 'superadmin';

-- Assign all permissions to superadmin role
INSERT INTO tenant_acme.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM tenant_acme.roles r
CROSS JOIN tenant_acme.permissions p
WHERE r.name = 'superadmin';

-- Seed default menus
INSERT INTO tenant_acme.menus (name, slug, icon, "order", is_active) VALUES
('Dashboard', 'dashboard', 'LayoutDashboard', 1, true),
('Management', 'management', 'Users', 2, true),
('Content', 'content', 'FileText', 3, true);

-- Get menu IDs and insert menu items
DO $$
DECLARE
    dashboard_menu_id BIGINT;
    mgmt_menu_id BIGINT;
    content_menu_id BIGINT;
BEGIN
    SELECT id INTO dashboard_menu_id FROM tenant_acme.menus WHERE slug = 'dashboard';
    SELECT id INTO mgmt_menu_id FROM tenant_acme.menus WHERE slug = 'management';
    SELECT id INTO content_menu_id FROM tenant_acme.menus WHERE slug = 'content';

    -- Dashboard menu items
    INSERT INTO tenant_acme.menu_items (menu_id, module_name, label, url, icon, "order", is_active) VALUES
    (dashboard_menu_id, 'dashboard', 'Overview', '/org/acme/portal/dashboard', 'LayoutDashboard', 1, true),
    (dashboard_menu_id, 'analytics', 'Analytics', '/org/acme/portal/analytics', 'BarChart3', 2, true);

    -- Management menu items
    INSERT INTO tenant_acme.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission) VALUES
    (mgmt_menu_id, 'users', 'Users', '/org/acme/portal/users', 'Users', 1, true, 'users.read'),
    (mgmt_menu_id, 'roles', 'Roles', '/org/acme/portal/roles', 'Shield', 2, true, 'roles.read');

    -- Content menu items
    INSERT INTO tenant_acme.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission) VALUES
    (content_menu_id, 'categories', 'Categories', '/org/acme/portal/categories', 'Folder', 1, true, 'categories.read'),
    (content_menu_id, 'tags', 'Tags', '/org/acme/portal/tags', 'Tag', 2, true, 'categories.read');
END $$;

-- ================================================
-- VERIFICATION
-- ================================================

-- Show created tenant
SELECT id, slug, name, schema_name, is_active FROM public.tenants WHERE slug = 'acme';

-- Show user assignment
SELECT 
    u.id as user_id,
    u.email,
    r.name as role_name,
    r.display_name
FROM tenant_acme.user_roles ur
JOIN public.users u ON ur.user_id = u.id
JOIN tenant_acme.roles r ON ur.role_id = r.id;

-- Show tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_acme' 
ORDER BY table_name;

-- Show menu count
SELECT COUNT(*) as menu_count FROM tenant_acme.menus;
SELECT COUNT(*) as menu_items_count FROM tenant_acme.menu_items;
