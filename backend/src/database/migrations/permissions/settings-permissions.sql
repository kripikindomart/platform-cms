-- Migration: Add settings module permissions
-- Generated: 2026-07-19
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read Settings', 'settings.read', 'settings', 'read', 'Permission to view and list settings'),
  ('Create Settings', 'settings.create', 'settings', 'create', 'Permission to create new settings'),
  ('Update Settings', 'settings.update', 'settings', 'update', 'Permission to update existing settings'),
  ('Delete Settings', 'settings.delete', 'settings', 'delete', 'Permission to delete settings');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'settings'
-- ON CONFLICT DO NOTHING;
