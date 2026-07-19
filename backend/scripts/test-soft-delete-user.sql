-- Test Script: Soft Delete User untuk Testing Trash Tab
-- Cara pakai: psql -U postgres -d cms -f test-soft-delete-user.sql

-- Soft delete user dengan ID 1 (admin@demo.com)
-- Pastikan untuk mengganti ID sesuai user yang ingin di-test
UPDATE public.users 
SET 
  deleted_at = NOW(),
  deleted_by = 7,  -- ID dari user yang menghapus (admin@platform.com)
  updated_at = NOW()
WHERE id = 1;

-- Verifikasi hasil
SELECT 
  id,
  email,
  name,
  is_active,
  deleted_at,
  deleted_by
FROM public.users
WHERE id = 1;

-- Untuk restore user kembali (undo soft delete):
-- UPDATE public.users 
-- SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
-- WHERE id = 1;
