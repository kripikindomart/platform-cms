-- Migration: Add test-items module permissions
-- Generated: 2026-07-16
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read TestItems', 'test-items.read', 'test-items', 'read', 'Permission to view and list test-items'),
  ('Create TestItems', 'test-items.create', 'test-items', 'create', 'Permission to create new test-items'),
  ('Update TestItems', 'test-items.update', 'test-items', 'update', 'Permission to update existing test-items'),
  ('Delete TestItems', 'test-items.delete', 'test-items', 'delete', 'Permission to delete test-items');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'test-items'
-- ON CONFLICT DO NOTHING;
