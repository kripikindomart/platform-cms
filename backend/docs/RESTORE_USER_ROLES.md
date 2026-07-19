# Restore User Roles - Implementation Guide

## Overview

Implementasi soft delete untuk `user_roles` di tenant schemas, memungkinkan user yang dinonaktifkan dari tenant untuk di-restore dengan **role yang sama seperti sebelumnya**.

## Features

### 1. **Soft Delete User from Tenant**
- User dinonaktifkan hanya dari tenant tertentu (tidak global)
- Role history disimpan dengan soft delete (`deleted_at`, `deleted_by`)
- User tetap bisa akses tenant lain
- **Optimistic UI update** dengan auto-rollback jika gagal
- Tidak refresh tabel - hanya update UI dan stats

### 2. **Restore User with Original Roles**
- ✅ Jika ada soft-deleted roles → restore role yang sama
- ✅ Jika user sudah aktif → no action needed
- ❌ Jika tidak ada history → error (gunakan Assign User)
- ✅ Support multiple roles per user
- **Optimistic UI update** dengan auto-rollback jika gagal

## Database Schema Changes

### New Columns in `user_roles` table (per tenant schema):

```sql
ALTER TABLE {tenant_schema}.user_roles 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE {tenant_schema}.user_roles 
ADD COLUMN deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX idx_user_roles_deleted_at 
ON {tenant_schema}.user_roles(deleted_at);
```

## Migration

### Run Migration SQL

```bash
# Connect to database
psql -U postgres -d platform_cms

# Run migration
\i backend/migrations/add-soft-delete-to-user-roles.sql
```

### What the Migration Does:

1. ✅ Loops through all existing tenant schemas
2. ✅ Adds `deleted_at` and `deleted_by` columns to `user_roles` table
3. ✅ Creates index on `deleted_at` for performance
4. ✅ Skips if columns already exist (idempotent)
5. ✅ Provides detailed logs for each tenant

### Expected Output:

```
NOTICE:  Processing tenant schema: tenant_abc123
NOTICE:    ✓ Added deleted_at column to tenant_abc123.user_roles
NOTICE:    ✓ Added deleted_by column to tenant_abc123.user_roles
NOTICE:    ✓ Created index idx_user_roles_deleted_at on tenant_abc123.user_roles
NOTICE:  Processing tenant schema: tenant_xyz789
NOTICE:    ✓ Added deleted_at column to tenant_xyz789.user_roles
...
NOTICE:  ✅ Migration completed successfully
```

## API Endpoints

### 1. Remove User from Tenant (Soft Delete)

```http
DELETE /api/tenants/:tenantId/users/:userId
```

**Behavior:**
- Soft delete: `UPDATE user_roles SET deleted_at = NOW(), deleted_by = :userId WHERE user_id = :userId`
- Preserves all role assignments for restoration
- User disappears from tenant's user list
- User can still login to other tenants
- **Optimistic UI update** - instant feedback, rollback on error

**Response:**
```json
{
  "success": true,
  "message": "User berhasil dinonaktifkan dari tenant Demo Company. User masih aktif di tenant lain."
}
```

### 2. Restore User to Tenant

```http
POST /api/tenants/:tenantId/users/:userId/restore
```

**Behavior:**

**Case 1: Has Soft-Deleted Roles** (restore original roles) ✅
```sql
UPDATE user_roles 
SET deleted_at = NULL, deleted_by = NULL
WHERE user_id = :userId AND deleted_at IS NOT NULL
```

**Case 2: Already Active** (no action needed)
```json
{
  "success": true,
  "message": "User sudah aktif di tenant Demo Company"
}
```

**Case 3: No History** (error - use Assign User instead) ❌
```json
{
  "code": "USER_NOT_FOUND_IN_TENANT",
  "message": "User tidak memiliki history di tenant Demo Company. Gunakan 'Assign User' untuk menambahkan user baru."
}
```

**Response (with original roles):**
```json
{
  "success": true,
  "message": "User berhasil diaktifkan kembali di tenant Demo Company dengan role: Administrator, Editor"
}
```

## User Flow Examples

### Example 1: Admin User Deactivation & Restoration

**Initial State:**
```
User: john@example.com
Tenant: Demo Company
Roles: Administrator, Editor
```

**Step 1: Deactivate**
```http
DELETE /api/tenants/1/users/5
```

**Database:**
```sql
-- user_roles table
user_id | role_id | deleted_at          | deleted_by
--------|---------|---------------------|------------
5       | 1       | 2026-07-19 15:30:00 | 10
5       | 2       | 2026-07-19 15:30:00 | 10
```

**Step 2: Restore**
```http
POST /api/tenants/1/users/5/restore
```

**Database:**
```sql
-- user_roles table (roles restored)
user_id | role_id | deleted_at | deleted_by
--------|---------|------------|------------
5       | 1       | NULL       | NULL
5       | 2       | NULL       | NULL
```

**Result:** User restored with both Administrator and Editor roles ✅

### Example 2: Guest User Deactivation & Restoration

**Initial State:**
```
User: guest@example.com
Tenant: Demo Company
Roles: Guest
```

**After Deactivate → Restore:**
```
Roles: Guest (sama seperti sebelumnya) ✅
```

## Backward Compatibility

### For Schemas WITHOUT `deleted_at` Column:

**Remove User:**
- Falls back to hard delete: `DELETE FROM user_roles WHERE user_id = :userId`
- No role history preserved

**Restore User:**
- Always assigns default "user" role
- Cannot restore original roles

### For Schemas WITH `deleted_at` Column:

**Remove User:**
- Soft delete with role preservation
- Full restore capability

**Restore User:**
- Restores original roles if available
- Falls back to default role if needed

## Frontend Integration

### Users Tab in Tenant Detail

**Switch Toggle in Status Column:**
- Direct toggle for activate/deactivate
- **Optimistic update** - instant UI feedback
- **Auto-rollback** if API fails (kembali ke status awal)
- Shows loading state while processing
- Toast notification only (no table refresh)

**Bulk Actions:**
- Checkbox selection for multiple users
- "Nonaktifkan (X)" button for bulk deactivate
- **Optimistic update** for all selected users
- **Partial rollback** if some operations fail
- Smart error handling (all fail, partial fail, all success)
- Vanilla JavaScript `confirm()` for confirmation

**UI Behavior:**
- ✅ **NO full table refresh** - only optimistic updates
- ✅ **Stats updated** optimistically (with rollback)
- ✅ **Selected rows cleared** after bulk action
- ✅ **Toast notifications** for feedback
- ❌ No `fetchTenantUsers()` or `fetchTenantDetail()` calls after toggle

## Testing

### Test Case 1: Remove & Restore Admin

```bash
# 1. Remove admin user
curl -X DELETE http://localhost:3000/api/tenants/1/users/5

# 2. Verify user not in list
curl http://localhost:3000/api/tenants/1/users

# 3. Restore user
curl -X POST http://localhost:3000/api/tenants/1/users/5/restore

# 4. Verify user has original admin role
curl http://localhost:3000/api/tenants/1/users
```

### Test Case 2: Remove & Restore Guest

```bash
# Same steps, verify role = Guest after restore
```

## Benefits

✅ **Role Preservation** - Roles are preserved and restored correctly  
✅ **Audit Trail** - Track who removed/restored user with `deleted_by`  
✅ **Tenant-Scoped** - Only affects specific tenant, not global  
✅ **Non-Destructive** - Data not lost, can be restored  
✅ **Backward Compatible** - Works with old and new schemas  
✅ **Performance** - Indexed for fast queries  

## Notes

- Migration is idempotent (safe to run multiple times)
- New tenants should automatically include these columns in provisioning
- Stats are updated to count only active users (exclude soft-deleted)
- User list queries automatically filter soft-deleted users
