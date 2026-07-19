-- ================================================
-- Recreate FK Constraints to public.users
-- ================================================
-- After removing tenant users table, recreate all
-- FK constraints to reference public.users instead
-- ================================================

-- roles table
ALTER TABLE tenant_demo_company.roles
  ADD CONSTRAINT roles_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE tenant_demo_company.roles
  ADD CONSTRAINT roles_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE tenant_demo_company.roles
  ADD CONSTRAINT roles_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- role_permissions table
ALTER TABLE tenant_demo_company.role_permissions
  ADD CONSTRAINT role_permissions_assigned_by_fkey
  FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- sessions table
ALTER TABLE tenant_demo_company.sessions
  ADD CONSTRAINT sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- audit_logs table
ALTER TABLE tenant_demo_company.audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- password_resets table
ALTER TABLE tenant_demo_company.password_resets
  ADD CONSTRAINT password_resets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- categories table
ALTER TABLE tenant_demo_company.categories
  ADD CONSTRAINT categories_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE tenant_demo_company.categories
  ADD CONSTRAINT categories_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE tenant_demo_company.categories
  ADD CONSTRAINT categories_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- tags table
ALTER TABLE tenant_demo_company.tags
  ADD CONSTRAINT tags_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE tenant_demo_company.tags
  ADD CONSTRAINT tags_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE tenant_demo_company.tags
  ADD CONSTRAINT tags_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- tenant_modules table
ALTER TABLE tenant_demo_company.tenant_modules
  ADD CONSTRAINT tenant_modules_enabled_by_fkey
  FOREIGN KEY (enabled_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE tenant_demo_company.tenant_modules
  ADD CONSTRAINT tenant_modules_disabled_by_fkey
  FOREIGN KEY (disabled_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Verify all constraints created
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  '✓ OK' as status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'tenant_demo_company'
  AND ccu.table_schema = 'public'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name, kcu.column_name;
