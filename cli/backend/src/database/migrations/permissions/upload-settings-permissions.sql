-- Migration: Add upload-settings module permissions
-- Generated: 2026-07-21
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
  ('Read UploadSettings', 'upload-settings.read', 'upload-settings', 'read', 'Permission to view and list upload-settings'),
  ('Create UploadSettings', 'upload-settings.create', 'upload-settings', 'create', 'Permission to create new upload-settings'),
  ('Update UploadSettings', 'upload-settings.update', 'upload-settings', 'update', 'Permission to update existing upload-settings'),
  ('Delete UploadSettings', 'upload-settings.delete', 'upload-settings', 'delete', 'Permission to delete upload-settings');

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = 'upload-settings'
-- ON CONFLICT DO NOTHING;
