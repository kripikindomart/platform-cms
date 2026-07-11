-- Migration: Add products module permissions
-- Generated: 2026-07-11
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read Products', 'products.read', 'products', 'read', 'Permission to view and list products'),
  ('Create Products', 'products.create', 'products', 'create', 'Permission to create new products'),
  ('Update Products', 'products.update', 'products', 'update', 'Permission to update existing products'),
  ('Delete Products', 'products.delete', 'products', 'delete', 'Permission to delete products');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'products'
-- ON CONFLICT DO NOTHING;
