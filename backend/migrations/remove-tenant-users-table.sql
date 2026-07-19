-- ================================================
-- Remove Users Table from Tenant Schemas
-- ================================================
-- This migration removes users table from tenant schemas
-- because users are now centralized in public.users
--
-- IMPORTANT: Run this AFTER verifying:
-- 1. All users exist in public.users
-- 2. All FK constraints updated to reference public.users
-- 3. Backend code uses public.users for authentication
-- ================================================

-- STEP 1: Verify no orphaned data
-- Check if there are users in tenant schema not in public
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM tenant_demo_company.users t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users p 
    WHERE p.email = t.email
  );
  
  IF orphaned_count > 0 THEN
    RAISE NOTICE 'WARNING: Found % users in tenant schema not in public.users', orphaned_count;
    RAISE NOTICE 'Consider migrating them first!';
  ELSE
    RAISE NOTICE 'OK: All tenant users exist in public.users';
  END IF;
END $$;

-- STEP 2: Show users that will be affected
SELECT 
  'tenant_demo_company' as schema,
  id,
  email,
  name,
  'Exists in public: ' || CASE 
    WHEN EXISTS(SELECT 1 FROM public.users WHERE email = tenant_demo_company.users.email)
    THEN 'YES ✓'
    ELSE 'NO ✗'
  END as status
FROM tenant_demo_company.users
ORDER BY id;

-- STEP 3: Drop FK constraints that reference tenant users table
-- (Should be none if migration completed correctly)

-- Check for FK constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema = 'tenant_demo_company'
  AND ccu.table_name = 'users';

-- Drop any remaining FK constraints (uncomment if needed)
-- ALTER TABLE tenant_demo_company.audit_logs 
--   DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
-- 
-- ALTER TABLE tenant_demo_company.sessions 
--   DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

-- STEP 4: Backup tenant users data (just in case)
CREATE TABLE IF NOT EXISTS public.backup_tenant_users_20260716 AS
SELECT 
  'tenant_demo_company' as source_schema,
  *
FROM tenant_demo_company.users;

COMMENT ON TABLE public.backup_tenant_users_20260716 IS 
  'Backup of tenant users before removing table from tenant schema';

-- STEP 5: Drop users table from tenant schema
DROP TABLE IF EXISTS tenant_demo_company.users CASCADE;

-- STEP 6: Verify table is removed
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'tenant_demo_company' 
      AND table_name = 'users'
    )
    THEN 'ERROR: Users table still exists in tenant schema!'
    ELSE 'SUCCESS: Users table removed from tenant schema'
  END as result;

-- STEP 7: Verify FK constraints are correct
SELECT 
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  CASE 
    WHEN ccu.table_schema = 'public' AND ccu.table_name = 'users'
    THEN '✓ Correct'
    WHEN ccu.table_name = 'users'
    THEN '✗ Wrong schema!'
    ELSE '- N/A'
  END as status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'tenant_demo_company'
  AND (kcu.column_name LIKE '%user%' OR kcu.column_name LIKE '%created_by%' OR kcu.column_name LIKE '%assigned_by%')
ORDER BY tc.table_name, kcu.column_name;

-- ================================================
-- SUMMARY
-- ================================================
-- Tables affected:
--   - tenant_demo_company.users (DROPPED)
--
-- FK constraints updated:
--   - tenant_demo_company.user_roles.user_id → public.users.id
--   - tenant_demo_company.user_roles.assigned_by → public.users.id
--   - Any other *_by fields should reference public.users
--
-- Backup created:
--   - public.backup_tenant_users_20260716
-- ================================================
