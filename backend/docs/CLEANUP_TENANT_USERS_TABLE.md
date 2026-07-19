# Cleanup: Remove Tenant Users Table

## Summary

Menghapus tabel `tenant_xxx.users` untuk menghindari duplikasi dan confusion. Sekarang **semua users disimpan di `public.users`** (shared across tenants).

## Changes Made

### 1. Database Migration

#### Drop Tenant Users Table
```sql
-- File: backend/migrations/remove-tenant-users-table.sql
DROP TABLE IF EXISTS tenant_demo_company.users CASCADE;
```

**Impact**: 15 FK constraints di-drop otomatis (CASCADE)

#### Recreate FK Constraints
```sql
-- File: backend/migrations/recreate-fk-to-public-users.sql
-- Semua FK yang point ke users sekarang reference public.users

ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- + 16 FK constraints lainnya (roles, sessions, audit_logs, dll)
```

**Result**: 17 FK constraints berhasil dibuat, semuanya point ke `public.users`

### 2. Schema Code Changes

#### Created: Public Users Schema
```
backend/src/database/schema/public/users.schema.ts
```

- Moved users schema dari tenant ke public
- Export User dan NewUser types

#### Deleted: Tenant Users Schema
```
❌ backend/src/database/schema/tenant/users.schema.ts (deleted)
```

#### Updated: All Tenant Schemas
Updated imports dari `./users.schema` ke `../public/users.schema`:
- `sessions.schema.ts`
- `roles.schema.ts`
- `user-roles.schema.ts`
- `password-resets.schema.ts`
- `tenant-modules.schema.ts`
- `audit-logs.schema.ts`
- `role-permissions.schema.ts`

#### Updated: Schema Index Files
- `public/index.ts` - Added users export
- `tenant/index.ts` - Removed users export

### 3. Repository Changes

#### Users Repository
**File**: `backend/src/modules/users/users.repository.ts`

**Before**:
```typescript
// Extended BaseRepository (tenant-aware)
class UsersRepository extends BaseRepository<User> {
  async findByEmail(email: string) {
    return this.withTenantSchema(async () => {
      // Query tenant schema
    });
  }
}
```

**After**:
```typescript
// Standalone repository (public schema only)
class UsersRepository {
  async findByEmail(email: string): Promise<User | null> {
    const results = await this.db
      .select()
      .from(users) // Direct query to public.users
      .where(and(eq(users.email, email), isNull(users.deleted_at)))
      .limit(1);
    
    return results[0] || null;
  }
}
```

**Changes**:
- ❌ No longer extends BaseRepository
- ❌ No longer uses withTenantSchema()
- ❌ Removed TenantContextService dependency
- ✅ Direct queries to public.users
- ✅ Added CRUD methods: findById, create, update, delete, updateLastLogin, updatePassword

#### Roles Repository
**File**: `backend/src/modules/roles/roles.repository.ts`

**Issue Found**: SQL query tanpa spasi antar fields
```sql
-- WRONG (caused parsing error)
SELECT p.id,p.name,p.slug,p.resource...

-- FIXED
SELECT p.id, p.name, p.slug, p.resource, p.action, p.scope...
```

**Method Fixed**: `getUserRolesWithPermissions()`
- Added spaces after commas in SELECT statements
- Fixed both role query and permissions query

#### Dashboard Service
**File**: `backend/src/modules/dashboard/dashboard.service.ts`

```typescript
// BEFORE
private async getUserCount() {
  const result = await this.db
    .select({ count: sql`count(*)::int` })
    .from(tenantSchema.users) // ❌ Wrong schema
    ...
}

// AFTER
private async getUserCount() {
  const result = await this.db
    .select({ count: sql`count(*)::int` })
    .from(publicSchema.users) // ✅ Correct schema
    ...
}
```

### 4. Service Changes

#### Users Service
**File**: `backend/src/modules/users/users.service.ts`

```typescript
// Updated create method to pass created_by correctly
async create(dto: CreateUserDto, createdBy?: number): Promise<User> {
  return this.usersRepository.create({
    ...dto,
    created_by: createdBy, // ✅ Added
  });
}
```

### 5. Import Updates

Updated all files importing User type:
- `auth.controller.ts`
- `auth-response.dto.ts`
- `jwt.strategy.ts`
- `current-user.decorator.ts`
- `users.service.ts`
- `users.repository.ts`

**Pattern**:
```typescript
// BEFORE
import { User } from '../../database/schema/tenant/users.schema';

// AFTER
import { User } from '../../database/schema/public/users.schema';
```

## Database Verification

### FK Constraints Check
```sql
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'tenant_demo_company'
  AND ccu.table_schema = 'public'
  AND ccu.table_name = 'users';
```

**Result**: 17 FK constraints found, all pointing to `public.users` ✅

### User Data Check
```sql
-- User exists in public schema
SELECT id, email, name FROM public.users WHERE email = 'admin@platform.com';
-- Result: user_id = 7

-- User has role in tenant schema
SELECT ur.user_id, r.name, COUNT(rp.permission_id) 
FROM tenant_demo_company.user_roles ur
JOIN tenant_demo_company.roles r ON ur.role_id = r.id
LEFT JOIN tenant_demo_company.role_permissions rp ON r.id = rp.role_id
WHERE ur.user_id = 7
GROUP BY ur.user_id, r.name;
-- Result: user_id 7, role 'superadmin', 14 permissions ✅
```

## Public Schema Tables Note

Discovered that `public` schema also has these tables (currently EMPTY):
- `public.roles` (0 rows)
- `public.permissions` (0 rows)
- `public.user_roles` (0 rows)
- `public.role_permissions` (0 rows)

**Recommendation**: 
- Keep them for future SuperAdmin-specific roles (optional)
- Or delete them to avoid confusion
- Document clearly which schema is used for what

**Current Decision**: Keep them but leave empty. Only use tenant schema for roles/permissions.

## Architecture After Cleanup

```
┌─────────────────────────────────────┐
│         PUBLIC SCHEMA               │
├─────────────────────────────────────┤
│  users ✅ (ALL users)               │
│  tenants                            │
│  modules                            │
│  roles (empty, reserved)            │
│  permissions (empty, reserved)      │
└─────────────────────────────────────┘
              ↑
              │ FK references
              │
┌─────────────────────────────────────┐
│    TENANT_DEMO_COMPANY SCHEMA       │
├─────────────────────────────────────┤
│  user_roles → public.users (FK)     │
│  roles                              │
│  permissions                        │
│  role_permissions                   │
│  sessions → public.users (FK)       │
│  audit_logs → public.users (FK)     │
│  password_resets → public.users (FK)│
│  categories                         │
│  tags                               │
│  menus                              │
└─────────────────────────────────────┘
```

## Benefits

1. **Single Source of Truth**: Users hanya di public.users
2. **No Duplication**: Tidak ada user yang duplicate di tenant schema
3. **Clear Separation**: Users global, roles/permissions per-tenant
4. **Consistent Auth**: Login selalu query public.users
5. **Cross-Tenant Access**: User bisa punya roles di multiple tenants

## Testing

### Test Scripts Created
```bash
# Login and test menu access
bash backend/tests/test-full-flow.sh

# Test roles endpoint
bash backend/tests/test-roles-endpoint.sh

# Test menu access
bash backend/tests/test-menu-access.sh
```

### Expected Flow
1. Login → Query `public.users` for authentication
2. JWT token generated with `userId` and `tenantId`
3. Protected endpoint → JWT validated
4. Load user with roles → Query `tenant_xxx.user_roles` + `tenant_xxx.roles` + `tenant_xxx.permissions`
5. Authorization check → CASL uses loaded permissions
6. Return data

## Known Issues & Fixes

### Issue 1: SQL Query Without Spaces ✅ FIXED
**Error**: `SELECTp.id,p.name,p.slug...`
**Fix**: Added spaces after commas in SQL template literals

### Issue 2: Backend Cache
**Problem**: Code changes not reflected after build
**Solution**: Manual restart required
```bash
# Kill backend
# rm -rf dist
# npm run build
# npm run start:dev
```

## Next Steps

1. ✅ Backend restart with fresh build
2. ⏳ Test full authentication flow
3. ⏳ Test authorization (permissions check)
4. ⏳ Test menu access endpoint
5. ⏳ Frontend integration test
6. Document multi-tenant login flow for frontend

## Files Changed

### Created
- `backend/src/database/schema/public/users.schema.ts`
- `backend/migrations/recreate-fk-to-public-users.sql`
- `backend/migrations/remove-tenant-users-table.sql`
- `backend/tests/test-full-flow.sh`
- `backend/tests/test-roles-endpoint.sh`
- `backend/tests/test-menu-access.sh`
- `backend/tests/test-auth-me.sh`

### Deleted
- `backend/src/database/schema/tenant/users.schema.ts`

### Modified
- All tenant schema files (7 files)
- `backend/src/modules/users/users.repository.ts`
- `backend/src/modules/users/users.service.ts`
- `backend/src/modules/roles/roles.repository.ts`
- `backend/src/modules/dashboard/dashboard.service.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth-response.dto.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
- `backend/src/common/decorators/current-user.decorator.ts`
- `backend/src/database/schema/public/index.ts`
- `backend/src/database/schema/tenant/index.ts`

## Build Status

- ✅ TypeScript compilation: SUCCESS
- ✅ No type errors
- ⏳ Runtime test: Pending backend restart
