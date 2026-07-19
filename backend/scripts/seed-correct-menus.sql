-- ================================================
-- Seed Correct Menus Based on Backend Modules
-- ================================================
-- Replace 'TENANT_SCHEMA' with actual schema name
-- ================================================

-- Main Menu: Dashboard
INSERT INTO TENANT_SCHEMA.menus (name, slug, icon, "order", is_active)
VALUES ('Dashboard', 'dashboard', 'LayoutDashboard', 1, true)
ON CONFLICT (slug) DO NOTHING;

-- Main Menu: User Management
INSERT INTO TENANT_SCHEMA.menus (name, slug, icon, "order", is_active)
VALUES ('User Management', 'user-management', 'Users', 2, true)
ON CONFLICT (slug) DO NOTHING;

-- Main Menu: Content Management (Future)
INSERT INTO TENANT_SCHEMA.menus (name, slug, icon, "order", is_active)
VALUES ('Content', 'content', 'FileText', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Main Menu: System
INSERT INTO TENANT_SCHEMA.menus (name, slug, icon, "order", is_active)
VALUES ('System', 'system', 'Settings', 99, true)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================
-- Menu Items for Dashboard
-- ==============================================
INSERT INTO TENANT_SCHEMA.menu_items (menu_id, module_name, label, url, icon, "order", required_permission)
SELECT 
  m.id,
  'dashboard',
  'Dashboard',
  '/portal/dashboard',
  'Home',
  1,
  'dashboard.read'
FROM TENANT_SCHEMA.menus m WHERE m.slug = 'dashboard'
ON CONFLICT DO NOTHING;

-- ==============================================
-- Menu Items for User Management
-- ==============================================

-- Users submenu
INSERT INTO TENANT_SCHEMA.menu_items (menu_id, module_name, label, url, icon, "order", required_permission)
SELECT 
  m.id,
  'users',
  'Users',
  '/portal/users',
  'User',
  1,
  'users.read'
FROM TENANT_SCHEMA.menus m WHERE m.slug = 'user-management'
ON CONFLICT DO NOTHING;

-- Roles submenu
INSERT INTO TENANT_SCHEMA.menu_items (menu_id, module_name, label, url, icon, "order", required_permission)
SELECT 
  m.id,
  'roles',
  'Roles',
  '/portal/roles',
  'Shield',
  2,
  'roles.read'
FROM TENANT_SCHEMA.menus m WHERE m.slug = 'user-management'
ON CONFLICT DO NOTHING;

-- Permissions submenu
INSERT INTO TENANT_SCHEMA.menu_items (menu_id, module_name, label, url, icon, "order", required_permission)
SELECT 
  m.id,
  'permissions',
  'Permissions',
  '/portal/permissions',
  'Lock',
  3,
  'permissions.read'
FROM TENANT_SCHEMA.menus m WHERE m.slug = 'user-management'
ON CONFLICT DO NOTHING;

-- ==============================================
-- Menu Items for System
-- ==============================================

-- Menus management
INSERT INTO TENANT_SCHEMA.menu_items (menu_id, module_name, label, url, icon, "order", required_permission)
SELECT 
  m.id,
  'menuses',
  'Menu Management',
  '/portal/menus',
  'Menu',
  1,
  'menuses.read'
FROM TENANT_SCHEMA.menus m WHERE m.slug = 'system'
ON CONFLICT DO NOTHING;

-- Tenants management (Platform level only)
INSERT INTO TENANT_SCHEMA.menu_items (menu_id, module_name, label, url, icon, "order", required_permission)
SELECT 
  m.id,
  'tenants',
  'Tenants',
  '/portal/tenants',
  'Building2',
  2,
  'tenants.read.platform'
FROM TENANT_SCHEMA.menus m WHERE m.slug = 'system'
ON CONFLICT DO NOTHING;

-- Verify
SELECT 
  m.name as menu_name,
  mi.label,
  mi.url,
  mi.required_permission
FROM TENANT_SCHEMA.menus m
LEFT JOIN TENANT_SCHEMA.menu_items mi ON mi.menu_id = m.id
ORDER BY m."order", mi."order";
