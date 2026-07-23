-- Menu Item Registration for Module Builder
-- This adds the Module Builder UI to the System menu
--
-- Usage:
--   psql -U postgres -d platform_cms -v tenant_schema=tenant_acme -f this_file.sql
--
-- Or set tenant schema manually:
--   \set tenant_schema 'tenant_acme'
--   \i this_file.sql

-- Set search path to tenant schema
SET search_path TO :tenant_schema, public;

-- Insert System menu group if not exists
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

-- Insert menu item for Module Builder
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Menu item for Module Builder registered successfully!';
  RAISE NOTICE '  - Menu: System';
  RAISE NOTICE '  - URL: /portal/module-builder';
  RAISE NOTICE '  - Icon: Blocks';
  RAISE NOTICE '  - Permission: module_generator.read.tenant';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '  1. Create permission: module_generator.read.tenant';
  RAISE NOTICE '  2. Create permission: module_generator.create.tenant';
  RAISE NOTICE '  3. Assign permissions to Admin role';
  RAISE NOTICE '  4. Refresh your browser to see the new menu item';
END $$;
