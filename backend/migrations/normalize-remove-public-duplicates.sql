-- ================================================
-- Normalisasi: Hapus Tabel Duplikat di Public
-- ================================================
-- Menghapus tabel yang seharusnya HANYA ada di tenant schema
-- Tabel-tabel ini akan menyebabkan confusion dan bug
-- ================================================

-- SAFETY CHECK: Pastikan data penting sudah di-backup
-- Run: pg_dump -U postgres -d platform_cms -t public.roles > backup_public_roles.sql

BEGIN;

-- Cek apakah ada data di public schema yang perlu dipindah
DO $$
DECLARE
  public_roles_count INT;
  public_permissions_count INT;
  public_user_roles_count INT;
BEGIN
  SELECT COUNT(*) INTO public_roles_count FROM public.roles;
  SELECT COUNT(*) INTO public_permissions_count FROM public.permissions;
  SELECT COUNT(*) INTO public_user_roles_count FROM public.user_roles;
  
  RAISE NOTICE 'Data in public schema:';
  RAISE NOTICE '  roles: % rows', public_roles_count;
  RAISE NOTICE '  permissions: % rows', public_permissions_count;
  RAISE NOTICE '  user_roles: % rows', public_user_roles_count;
  
  IF public_roles_count > 0 OR public_permissions_count > 0 OR public_user_roles_count > 0 THEN
    RAISE WARNING 'Public schema contains data! Please backup first.';
    RAISE WARNING 'Run: pg_dump -U postgres -d platform_cms -n public > backup_public_schema.sql';
    -- ROLLBACK; -- Uncomment to abort if data exists
  END IF;
END $$;

-- ====================================
-- DROP PUBLIC TABLES (CASCADE)
-- ====================================

-- Auth & Authorization (should be in tenant only)
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- Session & Security (tenant-specific)
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.password_resets CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Business Data (tenant-specific)
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;

-- Navigation (tenant-specific)
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;

-- Module Management (move to tenant)
-- Note: tenant_modules perlu analisis lebih lanjut
-- Bisa di public (registry) atau di tenant (config)
-- DROP TABLE IF EXISTS public.tenant_modules CASCADE;

COMMIT;

-- ====================================
-- Verification
-- ====================================
SELECT 
  'PUBLIC' as schema,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'roles', 'permissions', 'user_roles', 'role_permissions',
    'sessions', 'password_resets', 'audit_logs',
    'categories', 'tags', 'menus', 'menu_items'
  )
ORDER BY table_name;

-- Should return 0 rows if cleanup successful

-- ====================================
-- Final Public Schema Tables
-- ====================================
SELECT 
  'PUBLIC' as schema,
  table_name,
  CASE 
    WHEN table_name IN ('users', 'tenants', 'modules') THEN 'Core'
    WHEN table_name LIKE 'module_%' THEN 'Module Management'
    WHEN table_name LIKE 'generated_%' THEN 'CLI Generator'
    WHEN table_name LIKE 'generation_%' THEN 'CLI Generator'
    WHEN table_name = 'system_settings' THEN 'Configuration'
    ELSE 'Other'
  END as category
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY category, table_name;
