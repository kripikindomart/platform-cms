-- Migration: Add menus module permissions
-- Generated: 2026-07-16
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read Menus', 'menus.read', 'menus', 'read', 'Permission to view and list menus'),
  ('Create Menus', 'menus.create', 'menus', 'create', 'Permission to create new menus'),
  ('Update Menus', 'menus.update', 'menus', 'update', 'Permission to update existing menus'),
  ('Delete Menus', 'menus.delete', 'menus', 'delete', 'Permission to delete menus');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'menus'
-- ON CONFLICT DO NOTHING;
