-- Migration: Add orders module permissions
-- Generated: 2026-07-11
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read Orders', 'orders.read', 'orders', 'read', 'Permission to view and list orders'),
  ('Create Orders', 'orders.create', 'orders', 'create', 'Permission to create new orders'),
  ('Update Orders', 'orders.update', 'orders', 'update', 'Permission to update existing orders'),
  ('Delete Orders', 'orders.delete', 'orders', 'delete', 'Permission to delete orders');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'orders'
-- ON CONFLICT DO NOTHING;
