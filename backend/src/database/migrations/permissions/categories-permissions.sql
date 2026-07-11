-- Migration: Add categories module permissions
-- Generated: 2026-07-11
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read Categories', 'categories.read', 'categories', 'read', 'Permission to view and list categories'),
  ('Create Categories', 'categories.create', 'categories', 'create', 'Permission to create new categories'),
  ('Update Categories', 'categories.update', 'categories', 'update', 'Permission to update existing categories'),
  ('Delete Categories', 'categories.delete', 'categories', 'delete', 'Permission to delete categories');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'categories'
-- ON CONFLICT DO NOTHING;
