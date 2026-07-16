-- Migration: Add menu-items module permissions
-- Generated: 2026-07-16
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read MenuItems', 'menu-items.read', 'menu-items', 'read', 'Permission to view and list menu-items'),
  ('Create MenuItems', 'menu-items.create', 'menu-items', 'create', 'Permission to create new menu-items'),
  ('Update MenuItems', 'menu-items.update', 'menu-items', 'update', 'Permission to update existing menu-items'),
  ('Delete MenuItems', 'menu-items.delete', 'menu-items', 'delete', 'Permission to delete menu-items');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'menu-items'
-- ON CONFLICT DO NOTHING;
