-- ================================================
-- Seed Menus & Menu Items
-- ================================================
-- Creates default menu structure for demo_company
-- ================================================

-- Insert Main Menus
INSERT INTO tenant_demo_company.menus (name, slug, icon, "order", is_active, created_at, updated_at) VALUES
('Dashboard', 'dashboard', 'LayoutDashboard', 1, true, NOW(), NOW()),
('User Management', 'user-management', 'Users', 2, true, NOW(), NOW()),
('Content', 'content', 'FileText', 3, true, NOW(), NOW()),
('System', 'system', 'Settings', 4, true, NOW(), NOW());

-- Get menu IDs for reference
DO $$
DECLARE
    dashboard_menu_id BIGINT;
    user_mgmt_menu_id BIGINT;
    content_menu_id BIGINT;
    system_menu_id BIGINT;
BEGIN
    -- Get menu IDs
    SELECT id INTO dashboard_menu_id FROM tenant_demo_company.menus WHERE slug = 'dashboard';
    SELECT id INTO user_mgmt_menu_id FROM tenant_demo_company.menus WHERE slug = 'user-management';
    SELECT id INTO content_menu_id FROM tenant_demo_company.menus WHERE slug = 'content';
    SELECT id INTO system_menu_id FROM tenant_demo_company.menus WHERE slug = 'system';

    -- Insert Dashboard Menu Items
    INSERT INTO tenant_demo_company.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
    (dashboard_menu_id, 'dashboard', 'Overview', '/org/demo_company/portal/dashboard', 'LayoutDashboard', 1, true, 'dashboard.view', NOW(), NOW()),
    (dashboard_menu_id, 'dashboard', 'Analytics', '/org/demo_company/portal/analytics', 'BarChart3', 2, true, 'dashboard.view', NOW(), NOW()),
    (dashboard_menu_id, 'dashboard', 'Reports', '/org/demo_company/portal/reports', 'FileText', 3, true, 'dashboard.view', NOW(), NOW());

    -- Insert User Management Menu Items
    INSERT INTO tenant_demo_company.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
    (user_mgmt_menu_id, 'users', 'Users', '/org/demo_company/portal/users', 'Users', 1, true, 'users.view', NOW(), NOW()),
    (user_mgmt_menu_id, 'roles', 'Roles & Permissions', '/org/demo_company/portal/roles', 'Shield', 2, true, 'roles.view', NOW(), NOW()),
    (user_mgmt_menu_id, 'sessions', 'Active Sessions', '/org/demo_company/portal/sessions', 'Activity', 3, true, 'sessions.view', NOW(), NOW());

    -- Insert Content Menu Items
    INSERT INTO tenant_demo_company.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
    (content_menu_id, 'categories', 'Categories', '/org/demo_company/portal/categories', 'Folder', 1, true, 'categories.view', NOW(), NOW()),
    (content_menu_id, 'tags', 'Tags', '/org/demo_company/portal/tags', 'Tag', 2, true, 'tags.view', NOW(), NOW()),
    (content_menu_id, 'media', 'Media Library', '/org/demo_company/portal/media', 'Image', 3, true, 'media.view', NOW(), NOW());

    -- Insert System Menu Items
    INSERT INTO tenant_demo_company.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
    (system_menu_id, 'menus', 'Menu Management', '/org/demo_company/portal/menus', 'Menu', 1, true, 'menus.manage', NOW(), NOW()),
    (system_menu_id, 'settings', 'Settings', '/org/demo_company/portal/settings', 'Settings', 2, true, 'settings.manage', NOW(), NOW()),
    (system_menu_id, 'audit', 'Audit Logs', '/org/demo_company/portal/audit', 'FileSearch', 3, true, 'audit.view', NOW(), NOW());

END $$;

-- Verify inserted data
SELECT 
    m.name as menu_name,
    m.slug as menu_slug,
    COUNT(mi.id) as item_count
FROM tenant_demo_company.menus m
LEFT JOIN tenant_demo_company.menu_items mi ON m.id = mi.menu_id
WHERE m.deleted_at IS NULL
GROUP BY m.id, m.name, m.slug
ORDER BY m."order";

-- Show all menu items
SELECT 
    m.name as menu_name,
    mi.label,
    mi.url,
    mi.icon,
    mi."order",
    mi.required_permission
FROM tenant_demo_company.menus m
JOIN tenant_demo_company.menu_items mi ON m.id = mi.menu_id
WHERE m.deleted_at IS NULL AND mi.deleted_at IS NULL
ORDER BY m."order", mi."order";
