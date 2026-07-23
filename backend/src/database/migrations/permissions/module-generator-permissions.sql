-- Migration: Add module_generator permissions
-- This creates permissions for the Module Builder UI
--
-- Usage:
--   psql -U postgres -d platform_cms -v tenant_schema=tenant_acme -f this_file.sql
--
-- Or set tenant schema manually:
--   \set tenant_schema 'tenant_acme'
--   \i this_file.sql

-- Set search path to tenant schema
SET search_path TO :tenant_schema, public;

-- Insert permissions for module_generator
INSERT INTO permissions (resource, action, scope, description, created_at)
VALUES
  ('module_generator', 'read', 'tenant', 'Permission to view and list generated modules', NOW()),
  ('module_generator', 'create', 'tenant', 'Permission to generate new modules', NOW()),
  ('module_generator', 'update', 'tenant', 'Permission to update module metadata', NOW()),
  ('module_generator', 'delete', 'tenant', 'Permission to delete generated modules', NOW())
ON CONFLICT (resource, action) DO NOTHING;

-- Optionally assign all permissions to administrator role (role_id = 1)
-- Uncomment the following lines to auto-assign:

-- INSERT INTO role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM permissions 
-- WHERE resource = 'module_generator'
-- ON CONFLICT DO NOTHING;

-- Success message
DO $$
DECLARE
  perm_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perm_count
  FROM permissions 
  WHERE resource = 'module_generator';
  
  RAISE NOTICE '✓ Module Generator permissions created successfully!';
  RAISE NOTICE '  - Total permissions: %', perm_count;
  RAISE NOTICE '  - module_generator.read.tenant';
  RAISE NOTICE '  - module_generator.create.tenant';
  RAISE NOTICE '  - module_generator.update.tenant';
  RAISE NOTICE '  - module_generator.delete.tenant';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Step: Assign permissions to Admin role manually or uncomment auto-assign section above';
END $$;
