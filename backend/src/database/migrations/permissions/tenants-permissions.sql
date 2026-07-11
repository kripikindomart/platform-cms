-- Migration: Add tenants module permissions
-- Generated: 2026-07-12
-- NOTE: This uses tenant_demo_company schema. Update to target schema if needed.

INSERT INTO tenant_demo_company.permissions (resource, action, scope, description)
VALUES
  ('tenants', 'read', 'tenant', 'Permission to view and list tenants'),
  ('tenants', 'create', 'tenant', 'Permission to create new tenants'),
  ('tenants', 'update', 'tenant', 'Permission to update existing tenants'),
  ('tenants', 'delete', 'tenant', 'Permission to delete tenants');

-- Optionally assign all permissions to super_admin role
-- INSERT INTO tenant_demo_company.role_permissions (role_id, permission_id, assigned_by)
-- SELECT 
--   (SELECT id FROM tenant_demo_company.roles WHERE name = 'super_admin' LIMIT 1),
--   id,
--   NULL
-- FROM tenant_demo_company.permissions 
-- WHERE resource = 'tenants'
-- ON CONFLICT DO NOTHING;
