# Task 2.2: Create Tenant Schema Template

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 6 jam  
**Dependencies**: Task 2.1  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat database schema template untuk tenant-specific tables menggunakan Drizzle ORM. Schema ini akan digunakan sebagai template untuk setiap tenant schema (tenant_xxx) yang mencakup users, roles, permissions, RBAC junction tables, sessions, audit logs, dan master data.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File schema yang akan dibuat:

```
backend/src/database/schema/tenant/
├── users.schema.ts              (baru) - User authentication & profile
├── roles.schema.ts              (baru) - RBAC roles
├── permissions.schema.ts        (baru) - RBAC permissions
├── user-roles.schema.ts         (baru) - Junction: users ↔ roles
├── role-permissions.schema.ts   (baru) - Junction: roles ↔ permissions
├── tenant-modules.schema.ts     (baru) - Enabled modules per tenant
├── sessions.schema.ts           (baru) - User sessions (Redis backup)
├── audit-logs.schema.ts         (baru) - Audit trail (immutable)
├── password-resets.schema.ts    (baru) - Password recovery tokens
├── categories.schema.ts         (baru) - Master data categories (nested)
├── tags.schema.ts               (baru) - Master data tags (flat)
└── index.ts                     (baru) - Export semua schemas
```

**Total**: 11 tables + 1 index file

### 2. Table: users

**Fungsi**: Users dalam satu tenant (authentication & profile)

**Schema Fields**:
- `id` (bigserial, PK)
- `email` (varchar 255, UNIQUE, NOT NULL) - Email per tenant
- `password_hash` (varchar 255, NOT NULL) - Bcrypt hash
- `name` (varchar 255, NOT NULL) - Full name
- `phone` (varchar 20, nullable) - Phone number
- `avatar_url` (varchar 500, nullable) - Avatar image URL
- `is_active` (boolean, NOT NULL, default true) - Active status
- `is_verified` (boolean, NOT NULL, default false) - Email verified
- `last_login_at` (timestamp tz, nullable) - Last login timestamp
- `last_login_ip` (varchar 45, nullable) - Last login IP (IPv4/IPv6)
- `must_change_password` (boolean, NOT NULL, default false) - Force password change
- `password_changed_at` (timestamp tz, nullable) - Last password change
- **Audit fields**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft delete**: `deleted_at`, `deleted_by`

**Foreign Keys**:
- `created_by` → `users(id)` ON DELETE SET NULL
- `updated_by` → `users(id)` ON DELETE SET NULL
- `deleted_by` → `users(id)` ON DELETE SET NULL

**Indexes**:
- `email` (unique)
- `is_active`
- `deleted_at` (partial where deleted_at IS NULL)
- `created_by`

**Soft Delete**: ✅ MANDATORY

### 3. Table: roles

**Fungsi**: Roles untuk RBAC dalam tenant

**Schema Fields**:
- `id` (bigserial, PK)
- `name` (varchar 100, UNIQUE, NOT NULL) - Role identifier (admin, operator)
- `display_name` (varchar 255, NOT NULL) - Display name
- `description` (text, nullable) - Role description
- `is_system` (boolean, NOT NULL, default false) - System role (cannot delete)
- `is_active` (boolean, NOT NULL, default true) - Active status
- **Audit fields**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft delete**: `deleted_at`, `deleted_by`

**Foreign Keys**:
- `created_by` → `users(id)` ON DELETE SET NULL
- `updated_by` → `users(id)` ON DELETE SET NULL

**Indexes**:
- `name` (unique)
- `is_active`
- `is_system`
- `deleted_at` (partial where deleted_at IS NULL)

**Soft Delete**: ✅ MANDATORY

### 4. Table: permissions

**Fungsi**: Permissions untuk RBAC (instance dari module_permissions global)

**Schema Fields**:
- `id` (bigserial, PK)
- `resource` (varchar 100, NOT NULL) - Resource name (users, roles)
- `action` (varchar 50, NOT NULL) - create, read, update, delete, export, import
- `scope` (varchar 50, NOT NULL) - own, tenant, all
- `description` (text, nullable) - Permission description
- **Audit field**: `created_at`

**Constraints**:
- UNIQUE: `(resource, action, scope)`
- CHECK: `action IN ('create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'reject')`
- CHECK: `scope IN ('own', 'tenant', 'all')`

**Indexes**:
- `resource`
- `action`

**No Soft Delete**: Reference data

### 5. Table: user_roles

**Fungsi**: Junction table untuk many-to-many users ↔ roles

**Schema Fields**:
- `id` (bigserial, PK)
- `user_id` (bigint, FK to users, NOT NULL)
- `role_id` (bigint, FK to roles, NOT NULL)
- `assigned_at` (timestamp tz, NOT NULL, default NOW)
- `assigned_by` (bigint, FK to users, nullable) - Who assigned

**Constraints**:
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- FK: `role_id` → `roles(id)` ON DELETE CASCADE
- FK: `assigned_by` → `users(id)` ON DELETE SET NULL
- UNIQUE: `(user_id, role_id)` - Prevent duplicate assignments

**Indexes**:
- `user_id`
- `role_id`

**No Soft Delete**: Junction table, DELETE on revoke

### 6. Table: role_permissions

**Fungsi**: Junction table untuk many-to-many roles ↔ permissions

**Schema Fields**:
- `id` (bigserial, PK)
- `role_id` (bigint, FK to roles, NOT NULL)
- `permission_id` (bigint, FK to permissions, NOT NULL)
- `assigned_at` (timestamp tz, NOT NULL, default NOW)
- `assigned_by` (bigint, FK to users, nullable) - Who assigned

**Constraints**:
- FK: `role_id` → `roles(id)` ON DELETE CASCADE
- FK: `permission_id` → `permissions(id)` ON DELETE CASCADE
- FK: `assigned_by` → `users(id)` ON DELETE SET NULL
- UNIQUE: `(role_id, permission_id)` - Prevent duplicate assignments

**Indexes**:
- `role_id`
- `permission_id`

**No Soft Delete**: Junction table, DELETE on revoke

### 7. Table: tenant_modules

**Fungsi**: Enabled modules untuk tenant (instance dari modules global)

**Schema Fields**:
- `id` (bigserial, PK)
- `module_id` (bigint, NOT NULL) - Reference to public.modules (cross-schema FK)
- `is_enabled` (boolean, NOT NULL, default true) - Module enabled
- `config` (text/jsonb, nullable) - Custom config per tenant
- `enabled_at` (timestamp tz, NOT NULL, default NOW)
- `enabled_by` (bigint, FK to users, nullable)
- `disabled_at` (timestamp tz, nullable)
- `disabled_by` (bigint, FK to users, nullable)

**Constraints**:
- UNIQUE: `module_id` - One module only 1 record per tenant
- FK: `enabled_by` → `users(id)` ON DELETE SET NULL
- FK: `disabled_by` → `users(id)` ON DELETE SET NULL

**Indexes**:
- `module_id`
- `is_enabled`

**No Soft Delete**: Toggle `is_enabled` instead

### 8. Table: sessions

**Fungsi**: User sessions (PostgreSQL backup, Redis primary)

**Schema Fields**:
- `id` (varchar 255, PK) - Session ID (generated)
- `user_id` (bigint, FK to users, NOT NULL)
- `ip_address` (varchar 45, nullable) - IP address
- `user_agent` (text, nullable) - User agent string
- `payload` (text/jsonb, NOT NULL) - Session data
- `last_activity` (timestamp tz, NOT NULL) - Last activity timestamp
- `expires_at` (timestamp tz, NOT NULL) - Session expiry
- `created_at` (timestamp tz, NOT NULL, default NOW)

**Constraints**:
- FK: `user_id` → `users(id)` ON DELETE CASCADE

**Indexes**:
- `user_id`
- `last_activity`
- `expires_at`

**No Soft Delete**: Expired/logout DELETE immediately

### 9. Table: audit_logs

**Fungsi**: Audit trail untuk semua critical actions (IMMUTABLE)

**Schema Fields**:
- `id` (bigserial, PK)
- `user_id` (bigint, FK to users, nullable) - User who performed (NULL for system)
- `action` (varchar 50, NOT NULL) - create, update, delete, login, logout, export, import
- `resource` (varchar 100, NOT NULL) - Resource type (users, roles)
- `resource_id` (bigint, nullable) - ID dari resource yang diubah
- `description` (text, nullable) - Human-readable description
- `old_values` (text/jsonb, nullable) - Data before change (update/delete)
- `new_values` (text/jsonb, nullable) - Data after change (create/update)
- `ip_address` (varchar 45, nullable) - IP address
- `user_agent` (text, nullable) - User agent
- `created_at` (timestamp tz, NOT NULL, default NOW)

**Constraints**:
- FK: `user_id` → `users(id)` ON DELETE SET NULL
- CHECK: `action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject')`

**Indexes**:
- `user_id`
- `action`
- `resource`
- `resource_id`
- `created_at`
- Composite: `(resource, resource_id)`

**No Soft Delete**: Audit logs NEVER deleted (IMMUTABLE)

### 10. Table: password_resets

**Fungsi**: Token untuk password reset flow

**Schema Fields**:
- `id` (bigserial, PK)
- `user_id` (bigint, FK to users, NOT NULL)
- `token` (varchar 255, UNIQUE, NOT NULL) - Reset token (hashed)
- `expires_at` (timestamp tz, NOT NULL) - Token expiry (1 hour)
- `used_at` (timestamp tz, nullable) - Token used timestamp
- `created_at` (timestamp tz, NOT NULL, default NOW)

**Constraints**:
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UNIQUE: `token`

**Indexes**:
- `user_id`
- `token` (unique)
- `expires_at`

**No Soft Delete**: DELETE expired/used tokens

### 11. Table: categories

**Fungsi**: Master data categories (generic, nested support)

**Schema Fields**:
- `id` (bigserial, PK)
- `parent_id` (bigint, FK to categories, nullable) - Parent category (nested)
- `name` (varchar 255, NOT NULL) - Category name
- `slug` (varchar 255, NOT NULL) - URL-friendly slug
- `description` (text, nullable) - Category description
- `type` (varchar 50, NOT NULL) - Category type (content, product, document)
- `order` (integer, NOT NULL, default 0) - Display order
- `is_active` (boolean, NOT NULL, default true) - Active status
- **Audit fields**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft delete**: `deleted_at`, `deleted_by`

**Constraints**:
- FK: `parent_id` → `categories(id)` ON DELETE CASCADE (self-referencing)
- FK: `created_by` → `users(id)` ON DELETE SET NULL
- FK: `updated_by` → `users(id)` ON DELETE SET NULL
- UNIQUE: `(slug, type)` - Unique slug per type

**Indexes**:
- `parent_id`
- `slug`
- `type`
- `order`
- `deleted_at` (partial where deleted_at IS NULL)

**Soft Delete**: ✅ MANDATORY

### 12. Table: tags

**Fungsi**: Master data tags (flat, untuk tagging resources)

**Schema Fields**:
- `id` (bigserial, PK)
- `name` (varchar 100, NOT NULL) - Tag name
- `slug` (varchar 100, UNIQUE, NOT NULL) - URL-friendly slug
- `color` (varchar 7, nullable) - Hex color code (#3B82F6)
- `description` (text, nullable) - Tag description
- `usage_count` (integer, NOT NULL, default 0) - Berapa kali tag digunakan
- `is_active` (boolean, NOT NULL, default true) - Active status
- **Audit fields**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft delete**: `deleted_at`, `deleted_by`

**Constraints**:
- UNIQUE: `slug`
- FK: `created_by` → `users(id)` ON DELETE SET NULL
- FK: `updated_by` → `users(id)` ON DELETE SET NULL

**Indexes**:
- `slug` (unique)
- `name`
- `usage_count`
- `deleted_at` (partial where deleted_at IS NULL)

**Soft Delete**: ✅ MANDATORY

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] File `users.schema.ts` sudah dibuat dengan 17 columns, 4 indexes, 3 FKs
- [ ] File `roles.schema.ts` sudah dibuat dengan 11 columns, 4 indexes, 2 FKs
- [ ] File `permissions.schema.ts` sudah dibuat dengan 5 columns, 2 indexes, 2 CHECK constraints
- [ ] File `user-roles.schema.ts` sudah dibuat dengan 4 columns, 2 indexes, 3 FKs, 1 UNIQUE
- [ ] File `role-permissions.schema.ts` sudah dibuat dengan 4 columns, 2 indexes, 3 FKs, 1 UNIQUE
- [ ] File `tenant-modules.schema.ts` sudah dibuat dengan 8 columns, 2 indexes, 2 FKs, 1 UNIQUE
- [ ] File `sessions.schema.ts` sudah dibuat dengan 8 columns, 3 indexes, 1 FK
- [ ] File `audit-logs.schema.ts` sudah dibuat dengan 11 columns, 6 indexes, 1 FK, 1 CHECK
- [ ] File `password-resets.schema.ts` sudah dibuat dengan 6 columns, 3 indexes, 1 FK, 1 UNIQUE
- [ ] File `categories.schema.ts` sudah dibuat dengan 13 columns, 5 indexes, 3 FKs, 1 UNIQUE
- [ ] File `tags.schema.ts` sudah dibuat dengan 11 columns, 4 indexes, 2 FKs, 1 UNIQUE
- [ ] File `index.ts` sudah dibuat (export semua schemas)
- [ ] All schemas menggunakan Drizzle ORM dengan proper types
- [ ] Soft delete columns ada di: users, roles, categories, tags
- [ ] Audit columns ada di semua major tables
- [ ] Type exports (`Type`, `NewType`) sudah ada untuk semua tables
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] Migration file generated (drizzle-kit generate)
- [ ] Migration dapat dijalankan (drizzle-kit push)
- [ ] All foreign keys working
- [ ] All unique constraints working
- [ ] Can insert test data ke semua tables

---

## Cara Testing

### 1. Type Check

```bash
cd backend
npm run type-check
```

Expected: No TypeScript errors

### 2. Lint Check

```bash
npm run lint
```

Expected: No linting errors

### 3. Generate Migration

```bash
npm run db:generate
```

Expected: New migration file created

### 4. Push Schema to Database

```bash
npm run db:push
```

Expected: All 11 tables created in tenant schema

### 5. Verify Tables Created

Untuk testing, kita bisa create schema tenant_test:

```sql
CREATE SCHEMA IF NOT EXISTS tenant_test;
SET search_path TO tenant_test;
```

Kemudian verify:

```bash
psql -U postgres -d platform_cms
\dt tenant_test.*
```

Expected output (11 tables):
```
 Schema      |        Name         | Type  |  Owner   
-------------+---------------------+-------+----------
 tenant_test | users               | table | postgres
 tenant_test | roles               | table | postgres
 tenant_test | permissions         | table | postgres
 tenant_test | user_roles          | table | postgres
 tenant_test | role_permissions    | table | postgres
 tenant_test | tenant_modules      | table | postgres
 tenant_test | sessions            | table | postgres
 tenant_test | audit_logs          | table | postgres
 tenant_test | password_resets     | table | postgres
 tenant_test | categories          | table | postgres
 tenant_test | tags                | table | postgres
```

### 6. Check Foreign Keys

```sql
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema='tenant_test'
ORDER BY tc.table_name;
```

Expected: All defined foreign keys exist

### 7. Test Insert

```sql
-- Test insert user
INSERT INTO tenant_test.users (email, password_hash, name, is_active, is_verified)
VALUES ('admin@example.com', '$2b$12$hashedpassword', 'Admin User', true, true);

-- Test insert role
INSERT INTO tenant_test.roles (name, display_name, is_system)
VALUES ('admin', 'Administrator', true);

-- Test assign role to user
INSERT INTO tenant_test.user_roles (user_id, role_id)
VALUES (1, 1);

-- Test insert permission
INSERT INTO tenant_test.permissions (resource, action, scope)
VALUES ('users', 'create', 'tenant');

-- Test assign permission to role
INSERT INTO tenant_test.role_permissions (role_id, permission_id)
VALUES (1, 1);

-- Test soft delete user
UPDATE tenant_test.users 
SET deleted_at = NOW(), deleted_by = 1
WHERE id = 1;

-- Test restore user
UPDATE tenant_test.users 
SET deleted_at = NULL, deleted_by = NULL
WHERE id = 1;
```

### 8. Test Foreign Key Cascade

```sql
-- Test CASCADE delete (user_roles should be deleted when user deleted)
DELETE FROM tenant_test.users WHERE id = 1;
SELECT * FROM tenant_test.user_roles WHERE user_id = 1; -- Should be empty
```

---

## Implementasi Notes

### Drizzle ORM Relations

Untuk self-referencing (categories.parent_id):

```typescript
export const categories = pgTable('categories', {
  // columns...
  parent_id: bigint('parent_id', { mode: 'number' }).references(() => categories.id, { onDelete: 'cascade' }),
});
```

Untuk cross-schema FK (tenant_modules.module_id → public.modules):

```typescript
// Note: Cross-schema FK tidak fully supported di Drizzle schema definition
// Kita define di migration SQL atau skip FK constraint
// Validation dilakukan di application layer
```

### Audit Columns Pattern

Reusable mixin untuk audit columns:

```typescript
const auditColumns = {
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
};

const softDeleteColumns = {
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
};
```

### Naming Conventions

- **File names**: kebab-case (user-roles.schema.ts)
- **Table names**: snake_case (user_roles)
- **Column names**: snake_case (is_active, created_at)
- **Type names**: PascalCase (User, NewUser)
- **Index names**: idx_tablename_columnname

### Security Notes

1. **Password Storage**: NEVER store plaintext, always bcrypt hash
2. **Soft Delete**: MANDATORY untuk users, roles, categories, tags
3. **Audit Logs**: IMMUTABLE - never update or delete
4. **Sessions**: Primary storage Redis, PostgreSQL backup only
5. **Password Tokens**: Hash before store, expire after 1 hour

---

## Troubleshooting

**Problem**: Circular dependency (users references users)  
**Solution**: Use nullable foreign keys untuk created_by, updated_by

**Problem**: Self-referencing FK (categories.parent_id)  
**Solution**: Use `references(() => categories.id)`

**Problem**: Cross-schema FK not working  
**Solution**: Skip FK constraint in schema, validate in application layer

**Problem**: JSONB not available in Drizzle  
**Solution**: Use `text('config')` and JSON.parse/stringify in application

**Problem**: CHECK constraint not in Drizzle  
**Solution**: Add CHECK constraint in migration SQL manually

---

## Documentation References

- ERD-DATABASE.md Section 2 - Tenant schema tables detail
- AI-RULES.md Section 7.2 - Drizzle ORM patterns
- AI-RULES.md Section 7.5 - Soft delete mandatory (users, roles, categories, tags)
- AI-RULES.md Section 7.6 - Audit columns mandatory
- AI-RULES.md Section 7.7 - Database prohibitions
- Drizzle ORM docs: https://orm.drizzle.team/docs/overview

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 2.3: Migration System Implementation** - Implement migration runner untuk global & tenant schemas

---

## Output Expected

Setelah task selesai:
1. 11 schema files created dengan Drizzle ORM (43 total columns per ERD)
2. 1 index.ts file untuk export
3. Type-check dan lint passing
4. New migration file generated
5. All 11 tables dapat dibuat di tenant schema
6. All foreign keys working (self-referencing, cascade)
7. Soft delete columns present di 4 tables (users, roles, categories, tags)
8. Audit columns present di semua major tables
9. Unique constraints working
10. Can insert test data dan relationships working
11. Junction tables prevent duplicate assignments
12. CASCADE delete working untuk user_roles dan role_permissions

**Total Schema Complexity**:
- 11 tables
- ~90 total columns (varies per table)
- ~35 indexes
- ~20 foreign keys
- 4 tables dengan soft delete
- 8 tables dengan audit columns
- 2 junction tables
- 1 self-referencing table
- 2 CHECK constraints
