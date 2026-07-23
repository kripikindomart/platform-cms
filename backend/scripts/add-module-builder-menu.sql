-- ================================================================
-- Script: Add Module Builder Menu and Permissions
-- Description: Adds Module Builder to System menu with permissions
-- Target Schema: tenant_w6qezvzj01ofe4n2iny3y32tv2 (Platform Administration)
-- ================================================================

-- Set search path to tenant schema
SET search_path TO tenant_w6qezvzj01ofe4n2iny3y32tv2, public;

-- ================================================================
-- STEP 1: Create Permissions
-- ================================================================

INSERT INTO permissions (resource, action, scope, description, created_at)
VALUES
  ('module_generator', 'read', 'tenant', 'View and list generated modules', NOW()),
  ('module_generator', 'create', 'tenant', 'Generate new modules', NOW()),
  ('module_generator', 'update', 'tenant', 'Update module metadata', NOW()),
  ('module_generator', 'delete', 'tenant', 'Delete generated modules', NOW())
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ================================================================
-- STEP 2: Create System Menu (if not exists)
-- ================================================================

INSERT INTO menus (
  name,
  slug,
  icon,
  "order",
  is_active,
  created_at,
  updated_at
)
VALUES (
  'System',
  'system',
  'Settings',
  99,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- STEP 3: Add Module Builder Menu Item
-- ================================================================

INSERT INTO menu_items (
  menu_id,
  parent_id,
  module_name,
  label,
  url,
  icon,
  required_permission,
  "order",
  is_active,
  created_at,
  updated_at
)
SELECT 
  m.id AS menu_id,
  NULL AS parent_id,
  'module-builder' AS module_name,
  'Module Builder' AS label,
  '/portal/module-builder' AS url,
  'Blocks' AS icon,
  'module_generator.read.tenant' AS required_permission,
  (SELECT COALESCE(MAX("order"), 0) + 1 FROM menu_items WHERE menu_id = m.id AND parent_id IS NULL AND deleted_at IS NULL) AS "order",
  true AS is_active,
  NOW() AS created_at,
  NOW() AS updated_at
FROM menus m 
WHERE m.slug = 'system'
  AND m.is_active = true
  AND m.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM menu_items 
    WHERE module_name = 'module-builder' 
      AND menu_id = m.id
      AND deleted_at IS NULL
  );

-- ================================================================
-- STEP 4: Assign Permissions to SuperAdmin Role
-- ================================================================

-- Get SuperAdmin role ID
DO $$
DECLARE
  superadmin_role_id BIGINT;
  admin_user_id BIGINT;
  perm_id BIGINT;
BEGIN
  -- Find SuperAdmin role
  SELECT id INTO superadmin_role_id
  FROM roles 
  WHERE name = 'superadmin' OR name = 'super_admin'
  LIMIT 1;

  -- Find admin user
  SELECT id INTO admin_user_id
  FROM public.users
  WHERE email = 'admin@platform.com'
  LIMIT 1;

  IF superadmin_role_id IS NOT NULL THEN
    -- Assign all module_generator permissions to SuperAdmin
    FOR perm_id IN 
      SELECT id FROM permissions WHERE resource = 'module_generator'
    LOOP
      INSERT INTO role_permissions (role_id, permission_id, assigned_by, assigned_at)
      VALUES (superadmin_role_id, perm_id, admin_user_id, NOW())
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE '✓ Assigned module_generator permissions to SuperAdmin role';
  ELSE
    RAISE WARNING '⚠ SuperAdmin role not found. Please assign permissions manually.';
  END IF;
END $$;

-- ================================================================
-- STEP 5: Verification
-- ================================================================

-- Show created permissions
SELECT 
  '✓ Permissions Created' as status,
  resource || '.' || action || '.' || scope as permission,
  description
FROM permissions 
WHERE resource = 'module_generator';

-- Show menu item
SELECT 
  '✓ Menu Item Created' as status,
  m.name as menu,
  mi.label,
  mi.url,
  mi.icon,
  mi.required_permission
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id
WHERE mi.module_name = 'module-builder'
  AND mi.deleted_at IS NULL;

-- Show role assignments
SELECT 
  '✓ Role Assignments' as status,
  r.name as role,
  COUNT(rp.permission_id) as permissions_assigned
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource = 'module_generator'
GROUP BY r.name;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '✓ Module Builder Setup Complete!';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was created:';
  RAISE NOTICE '  ✓ 4 Permissions (module_generator.*)';
  RAISE NOTICE '  ✓ 1 Menu Item (System > Module Builder)';
  RAISE NOTICE '  ✓ Permission assignments to SuperAdmin';
  RAISE NOTICE '';
  RAISE NOTICE 'Access:';
  RAISE NOTICE '  URL: /portal/module-builder';
  RAISE NOTICE '  Icon: Blocks';
  RAISE NOTICE '  Permission: module_generator.read.tenant';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '  2. Look for "Module Builder" in System menu';
  RAISE NOTICE '  3. Start building modules!';
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
END $$;

-- Reset search path
SET search_path TO public;
