-- Migration: Add tags module permissions
-- Generated: 2026-07-11
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read Tags', 'tags.read', 'tags', 'read', 'Permission to view and list tags'),
  ('Create Tags', 'tags.create', 'tags', 'create', 'Permission to create new tags'),
  ('Update Tags', 'tags.update', 'tags', 'update', 'Permission to update existing tags'),
  ('Delete Tags', 'tags.delete', 'tags', 'delete', 'Permission to delete tags');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'tags'
-- ON CONFLICT DO NOTHING;
