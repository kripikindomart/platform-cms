-- Fix user_roles FK constraints to reference public.users instead of tenant users

-- Drop existing FK constraints
ALTER TABLE tenant_demo_company.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE tenant_demo_company.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_assigned_by_fkey;

-- Add new FK constraints to public.users
ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id)
  ON DELETE CASCADE;

ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_assigned_by_fkey
  FOREIGN KEY (assigned_by) 
  REFERENCES public.users(id)
  ON DELETE SET NULL;

-- Verify constraints
SELECT 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'tenant_demo_company'
  AND tc.table_name = 'user_roles';
