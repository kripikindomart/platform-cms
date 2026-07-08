# ERD DATABASE DESIGN
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Database Design Specification  
**Reference**: PROJECT-BRIEF.md, PRD.md, FEATURE-LIST.md, USER-FLOW.md

---

## Pendahuluan

Dokumen ini berisi rancangan database lengkap untuk Platform CMS MVP (Phase 1). Database dirancang untuk mendukung multi-tenancy dengan schema-based isolation menggunakan PostgreSQL.

### Prinsip Desain

1. **Multi-Tenancy**: Schema-based isolation (setiap tenant punya schema sendiri: `tenant_xxx`)
2. **Soft Delete**: Mandatory untuk semua data krusial (users, tenants, roles, dll)
3. **Audit Trail**: Track who created, updated, deleted data
4. **Type Safety**: Gunakan proper types (bigint untuk ID, timestamp with timezone)
5. **Indexing**: Index untuk foreign keys, search fields, dan filter fields
6. **Naming Convention**: snake_case untuk semua nama tabel dan kolom

### Database Engine

- **Primary**: PostgreSQL 15+
- **Alasan**: Native JSON support, schema-based multi-tenancy, full-text search, performance

---

## Arsitektur Multi-Tenancy

### Schema Structure

```
PostgreSQL Database: platform_cms
│
├── Schema: public (Global tables)
│   ├── tenants
│   ├── modules
│   ├── module_permissions
│   └── system_settings
│
├── Schema: tenant_001 (Tenant A)
│   ├── users
│   ├── roles
│   ├── permissions
│   ├── user_roles
│   ├── role_permissions
│   ├── tenant_modules
│   ├── sessions
│   ├── audit_logs
│   ├── categories
│   ├── tags
│   └── ... (application tables)
│
└── Schema: tenant_002 (Tenant B)
    ├── users
    ├── roles
    └── ... (same structure)
```

### Global vs Tenant Tables

**Global Tables** (schema: `public`):
- `tenants` - Daftar semua tenants
- `modules` - Module registry
- `module_permissions` - Permissions template per module
- `system_settings` - System-wide configuration

**Tenant Tables** (schema: `tenant_xxx`):
- `users` - Users dalam tenant
- `roles` - Roles dalam tenant
- `permissions` - Permissions dalam tenant
- `user_roles` - Junction table
- `role_permissions` - Junction table
- `tenant_modules` - Enabled modules untuk tenant
- `sessions` - User sessions
- `audit_logs` - Audit trail
- `categories`, `tags` - Master data
- Application-specific tables

---

## Ringkasan Tabel

### Global Schema Tables

| No | Tabel | Fungsi | Soft Delete | Prioritas |
|----|-------|--------|-------------|-----------|
| 1 | tenants | Daftar semua tenants | ✅ Yes | P0 |
| 2 | modules | Module registry | ❌ No | P1 |
| 3 | module_permissions | Permissions template per module | ❌ No | P1 |
| 4 | system_settings | System configuration (key-value) | ❌ No | P1 |

### Tenant Schema Tables

| No | Tabel | Fungsi | Soft Delete | Prioritas |
|----|-------|--------|-------------|-----------|
| 1 | users | Users dalam tenant | ✅ Yes | P0 |
| 2 | roles | Roles untuk RBAC | ✅ Yes | P0 |
| 3 | permissions | Permissions untuk RBAC | ❌ No | P0 |
| 4 | user_roles | Junction: users ↔ roles | ❌ No | P0 |
| 5 | role_permissions | Junction: roles ↔ permissions | ❌ No | P0 |
| 6 | tenant_modules | Enabled modules | ❌ No | P1 |
| 7 | sessions | User sessions (Redis backup) | ❌ No | P0 |
| 8 | audit_logs | Audit trail | ❌ No | P0 |
| 9 | password_resets | Password reset tokens | ❌ No | P1 |
| 10 | categories | Master data categories | ✅ Yes | P1 |
| 11 | tags | Master data tags | ✅ Yes | P1 |

**Total Tables**: 15 tables (4 global + 11 tenant)

---

## 1. Global Schema Tables

### 1.1 Table: tenants

**Fungsi**: Menyimpan daftar semua tenants dalam platform

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| name | VARCHAR(255) | NOT NULL | Nama tenant (display) |
| slug | VARCHAR(100) | NOT NULL | URL-friendly identifier (unique) |
| domain | VARCHAR(255) | NULL | Custom domain (optional) |
| schema_name | VARCHAR(100) | NOT NULL | PostgreSQL schema name (tenant_xxx) |
| subscription_tier | VARCHAR(50) | NOT NULL | free, basic, pro, enterprise |
| subscription_expires_at | TIMESTAMP WITH TIME ZONE | NULL | Tanggal expiry subscription |
| config | JSONB | NULL | Custom configuration per tenant |
| is_active | BOOLEAN | NOT NULL | Active status (default: true) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp updated |
| created_by | BIGINT | NULL | User ID yang create (nullable untuk system) |
| updated_by | BIGINT | NULL | User ID yang update |
| deleted_at | TIMESTAMP WITH TIME ZONE | NULL | Soft delete timestamp |
| deleted_by | BIGINT | NULL | User ID yang delete |

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `slug`
- UNIQUE: `domain` (where domain IS NOT NULL)
- UNIQUE: `schema_name`
- CHECK: `subscription_tier IN ('free', 'basic', 'pro', 'enterprise')`

**Indexes**:
- `idx_tenants_slug` ON (slug)
- `idx_tenants_domain` ON (domain) WHERE domain IS NOT NULL
- `idx_tenants_is_active` ON (is_active)
- `idx_tenants_deleted_at` ON (deleted_at) WHERE deleted_at IS NULL

**JSONB config structure example**:
```json
{
  "branding": {
    "logo": "url",
    "primaryColor": "#3B82F6",
    "secondaryColor": "#8B5CF6"
  },
  "features": {
    "maxUsers": 100,
    "maxStorage": 10737418240,
    "enabledFeatures": ["reporting", "export"]
  },
  "limits": {
    "apiRateLimit": 1000,
    "storageLimit": 10737418240
  }
}
```

---

### 1.2 Table: modules

**Fungsi**: Registry semua modules yang tersedia dalam platform

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| name | VARCHAR(100) | NOT NULL | Module name (identifier, e.g., 'user-management') |
| display_name | VARCHAR(255) | NOT NULL | Display name (e.g., 'User Management') |
| description | TEXT | NULL | Module description |
| icon | VARCHAR(50) | NULL | Icon name (lucide icons) |
| route_prefix | VARCHAR(100) | NOT NULL | Route prefix (e.g., '/users') |
| is_core | BOOLEAN | NOT NULL | Core module (cannot be disabled, default: false) |
| is_active | BOOLEAN | NOT NULL | Global active status (default: true) |
| order | INTEGER | NOT NULL | Display order dalam menu (default: 0) |
| version | VARCHAR(20) | NOT NULL | Module version (e.g., '1.0.0') |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp updated |

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `name`
- UNIQUE: `route_prefix`

**Indexes**:
- `idx_modules_name` ON (name)
- `idx_modules_is_active` ON (is_active)
- `idx_modules_is_core` ON (is_core)
- `idx_modules_order` ON (order)

**No Soft Delete**: Module tidak perlu soft delete, cukup set is_active = false

---

### 1.3 Table: module_permissions

**Fungsi**: Template permissions per module (global)

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| module_id | BIGINT | NOT NULL | Foreign key ke modules |
| resource | VARCHAR(100) | NOT NULL | Resource name (e.g., 'users') |
| action | VARCHAR(50) | NOT NULL | Action (create, read, update, delete) |
| scope | VARCHAR(50) | NOT NULL | Scope (own, tenant, all) |
| description | TEXT | NULL | Permission description |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `module_id` REFERENCES `modules(id)` ON DELETE CASCADE
- UNIQUE: `(module_id, resource, action, scope)`
- CHECK: `action IN ('create', 'read', 'update', 'delete', 'export', 'import')`
- CHECK: `scope IN ('own', 'tenant', 'all')`

**Indexes**:
- `idx_module_permissions_module_id` ON (module_id)
- `idx_module_permissions_resource` ON (resource)

**No Soft Delete**: Permissions adalah data reference

---

### 1.4 Table: system_settings

**Fungsi**: System-wide configuration (key-value store)

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| key | VARCHAR(100) | NOT NULL | Setting key (e.g., 'site_name') |
| value | TEXT | NULL | Setting value |
| type | VARCHAR(50) | NOT NULL | Data type (string, number, boolean, json) |
| description | TEXT | NULL | Setting description |
| is_public | BOOLEAN | NOT NULL | Can be accessed by frontend? (default: false) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp updated |
| updated_by | BIGINT | NULL | User ID yang update |

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `key`
- CHECK: `type IN ('string', 'number', 'boolean', 'json')`

**Indexes**:
- `idx_system_settings_key` ON (key)
- `idx_system_settings_is_public` ON (is_public)

**No Soft Delete**: Settings adalah data configuration

**Example data**:
```
key: 'site_name', value: 'Platform CMS', type: 'string'
key: 'maintenance_mode', value: 'false', type: 'boolean'
key: 'default_language', value: 'id', type: 'string'
key: 'default_timezone', value: 'Asia/Jakarta', type: 'string'
```

---

## 2. Tenant Schema Tables

### 2.1 Table: users

**Fungsi**: Menyimpan data users dalam satu tenant

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| email | VARCHAR(255) | NOT NULL | Email (unique per tenant) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash password |
| name | VARCHAR(255) | NOT NULL | Full name |
| phone | VARCHAR(20) | NULL | Phone number |
| avatar_url | VARCHAR(500) | NULL | Avatar image URL |
| is_active | BOOLEAN | NOT NULL | Active status (default: true) |
| is_verified | BOOLEAN | NOT NULL | Email verified status (default: false) |
| last_login_at | TIMESTAMP WITH TIME ZONE | NULL | Last login timestamp |
| last_login_ip | VARCHAR(45) | NULL | Last login IP address |
| must_change_password | BOOLEAN | NOT NULL | Force password change (default: false) |
| password_changed_at | TIMESTAMP WITH TIME ZONE | NULL | Last password change |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp updated |
| created_by | BIGINT | NULL | User ID yang create (nullable untuk system) |
| updated_by | BIGINT | NULL | User ID yang update |
| deleted_at | TIMESTAMP WITH TIME ZONE | NULL | Soft delete timestamp |
| deleted_by | BIGINT | NULL | User ID yang delete |

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `email` (per tenant schema)
- FOREIGN KEY: `created_by` REFERENCES `users(id)` ON DELETE SET NULL
- FOREIGN KEY: `updated_by` REFERENCES `users(id)` ON DELETE SET NULL
- FOREIGN KEY: `deleted_by` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes**:
- `idx_users_email` ON (email)
- `idx_users_is_active` ON (is_active)
- `idx_users_deleted_at` ON (deleted_at) WHERE deleted_at IS NULL
- `idx_users_created_by` ON (created_by)

**Soft Delete**: ✅ Yes (mandatory untuk users)

**Catatan**:
- Password harus di-hash dengan bcrypt (cost factor: 10-12)
- Email verification flow: `is_verified = false` → kirim email → set `true`
- Force password change untuk first login atau reset by admin

---

### 2.2 Table: roles

**Fungsi**: Menyimpan roles untuk RBAC dalam tenant

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| name | VARCHAR(100) | NOT NULL | Role name (unique, e.g., 'admin') |
| display_name | VARCHAR(255) | NOT NULL | Display name (e.g., 'Administrator') |
| description | TEXT | NULL | Role description |
| is_system | BOOLEAN | NOT NULL | System role (cannot be deleted, default: false) |
| is_active | BOOLEAN | NOT NULL | Active status (default: true) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp updated |
| created_by | BIGINT | NULL | User ID yang create |
| updated_by | BIGINT | NULL | User ID yang update |
| deleted_at | TIMESTAMP WITH TIME ZONE | NULL | Soft delete timestamp |
| deleted_by | BIGINT | NULL | User ID yang delete |

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `name` (per tenant schema)
- FOREIGN KEY: `created_by` REFERENCES `users(id)` ON DELETE SET NULL
- FOREIGN KEY: `updated_by` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes**:
- `idx_roles_name` ON (name)
- `idx_roles_is_active` ON (is_active)
- `idx_roles_is_system` ON (is_system)
- `idx_roles_deleted_at` ON (deleted_at) WHERE deleted_at IS NULL

**Soft Delete**: ✅ Yes (protect dari accidental deletion)

**System Roles** (seeded data):
- `super_admin` - Full access ke semua module dan permissions
- `admin` - Admin tenant dengan access terbatas
- `operator` - User biasa dengan permissions custom

---

### 2.3 Table: permissions

**Fungsi**: Menyimpan permissions untuk RBAC dalam tenant (instance dari module_permissions)

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| resource | VARCHAR(100) | NOT NULL | Resource name (e.g., 'users') |
| action | VARCHAR(50) | NOT NULL | Action (create, read, update, delete) |
| scope | VARCHAR(50) | NOT NULL | Scope (own, tenant, all) |
| description | TEXT | NULL | Permission description |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `(resource, action, scope)` (per tenant schema)
- CHECK: `action IN ('create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'reject')`
- CHECK: `scope IN ('own', 'tenant', 'all')`

**Indexes**:
- `idx_permissions_resource` ON (resource)
- `idx_permissions_action` ON (action)

**No Soft Delete**: Permissions adalah data reference

**Catatan**:
- Permissions di-seed saat tenant setup berdasarkan `module_permissions` global
- Permissions bisa dikustomisasi per tenant jika diperlukan

**Contoh Permissions**:
```
resource: 'users', action: 'create', scope: 'tenant' → Buat user dalam tenant
resource: 'users', action: 'read', scope: 'own' → Baca data user sendiri
resource: 'users', action: 'update', scope: 'tenant' → Update semua user dalam tenant
resource: 'reports', action: 'export', scope: 'tenant' → Export reports
```

---

### 2.4 Table: user_roles

**Fungsi**: Junction table untuk many-to-many relationship users ↔ roles

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| user_id | BIGINT | NOT NULL | Foreign key ke users |
| role_id | BIGINT | NOT NULL | Foreign key ke roles |
| assigned_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp assigned |
| assigned_by | BIGINT | NULL | User ID yang assign |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- FOREIGN KEY: `role_id` REFERENCES `roles(id)` ON DELETE CASCADE
- FOREIGN KEY: `assigned_by` REFERENCES `users(id)` ON DELETE SET NULL
- UNIQUE: `(user_id, role_id)` (prevent duplicate assignments)

**Indexes**:
- `idx_user_roles_user_id` ON (user_id)
- `idx_user_roles_role_id` ON (role_id)

**No Soft Delete**: Junction table, cukup DELETE jika revoke role

**Catatan**:
- Satu user bisa punya multiple roles
- Permissions final adalah UNION dari semua permissions roles user tersebut

---

### 2.5 Table: role_permissions

**Fungsi**: Junction table untuk many-to-many relationship roles ↔ permissions

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| role_id | BIGINT | NOT NULL | Foreign key ke roles |
| permission_id | BIGINT | NOT NULL | Foreign key ke permissions |
| assigned_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp assigned |
| assigned_by | BIGINT | NULL | User ID yang assign |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `role_id` REFERENCES `roles(id)` ON DELETE CASCADE
- FOREIGN KEY: `permission_id` REFERENCES `permissions(id)` ON DELETE CASCADE
- FOREIGN KEY: `assigned_by` REFERENCES `users(id)` ON DELETE SET NULL
- UNIQUE: `(role_id, permission_id)` (prevent duplicate assignments)

**Indexes**:
- `idx_role_permissions_role_id` ON (role_id)
- `idx_role_permissions_permission_id` ON (permission_id)

**No Soft Delete**: Junction table, cukup DELETE jika revoke permission

---

### 2.6 Table: tenant_modules

**Fungsi**: Enabled modules untuk tenant (instance dari modules global)

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| module_id | BIGINT | NOT NULL | Foreign key ke public.modules |
| is_enabled | BOOLEAN | NOT NULL | Module enabled untuk tenant (default: true) |
| config | JSONB | NULL | Custom config per tenant untuk module ini |
| enabled_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp enabled |
| enabled_by | BIGINT | NULL | User ID yang enable |
| disabled_at | TIMESTAMP WITH TIME ZONE | NULL | Timestamp disabled |
| disabled_by | BIGINT | NULL | User ID yang disable |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `module_id` REFERENCES `public.modules(id)` ON DELETE CASCADE
- FOREIGN KEY: `enabled_by` REFERENCES `users(id)` ON DELETE SET NULL
- FOREIGN KEY: `disabled_by` REFERENCES `users(id)` ON DELETE SET NULL
- UNIQUE: `module_id` (per tenant schema, satu module hanya 1 record)

**Indexes**:
- `idx_tenant_modules_module_id` ON (module_id)
- `idx_tenant_modules_is_enabled` ON (is_enabled)

**No Soft Delete**: Cukup toggle `is_enabled`

**JSONB config structure example**:
```json
{
  "customSettings": {
    "showDashboardWidget": true,
    "defaultView": "list",
    "itemsPerPage": 25
  },
  "limits": {
    "maxRecords": 10000
  }
}
```

**Catatan**:
- Saat tenant pertama kali dibuat, core modules otomatis di-enable
- Non-core modules bisa di-enable/disable oleh admin tenant
- Module dengan `is_core = true` di global modules tidak bisa di-disable

---

### 2.7 Table: sessions

**Fungsi**: Menyimpan user sessions (dengan Redis sebagai primary storage)

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | VARCHAR(255) | NOT NULL | Session ID (generated) |
| user_id | BIGINT | NOT NULL | Foreign key ke users |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | TEXT | NULL | User agent string |
| payload | JSONB | NOT NULL | Session data |
| last_activity | TIMESTAMP WITH TIME ZONE | NOT NULL | Last activity timestamp |
| expires_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Session expiry |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Indexes**:
- `idx_sessions_user_id` ON (user_id)
- `idx_sessions_last_activity` ON (last_activity)
- `idx_sessions_expires_at` ON (expires_at)

**No Soft Delete**: Session expired atau logout langsung DELETE

**JSONB payload structure example**:
```json
{
  "userId": 123,
  "roles": ["admin"],
  "permissions": ["users.create", "users.read"],
  "preferences": {
    "theme": "dark",
    "language": "id"
  }
}
```

**Catatan**:
- Primary session storage: **Redis** (fast access)
- PostgreSQL session table: **Backup/fallback** (jika Redis down)
- Cleanup old sessions dengan cron job (delete where `expires_at < NOW()`)
- Session duration default: 24 hours (configurable)

---

### 2.8 Table: audit_logs

**Fungsi**: Audit trail untuk semua critical actions dalam tenant

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| user_id | BIGINT | NULL | User yang perform action (NULL untuk system) |
| action | VARCHAR(50) | NOT NULL | Action type (create, update, delete, login, etc) |
| resource | VARCHAR(100) | NOT NULL | Resource type (users, roles, etc) |
| resource_id | BIGINT | NULL | ID dari resource yang diubah |
| description | TEXT | NULL | Human-readable description |
| old_values | JSONB | NULL | Data sebelum perubahan (untuk update/delete) |
| new_values | JSONB | NULL | Data setelah perubahan (untuk create/update) |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | TEXT | NULL | User agent |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp action |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE SET NULL
- CHECK: `action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject')`

**Indexes**:
- `idx_audit_logs_user_id` ON (user_id)
- `idx_audit_logs_action` ON (action)
- `idx_audit_logs_resource` ON (resource)
- `idx_audit_logs_resource_id` ON (resource_id)
- `idx_audit_logs_created_at` ON (created_at)
- Composite: `idx_audit_logs_resource_composite` ON (resource, resource_id)

**No Soft Delete**: Audit logs NEVER deleted (immutable)

**JSONB structure example**:
```json
// old_values (update/delete)
{
  "name": "John Doe",
  "email": "old@example.com",
  "is_active": true
}

// new_values (create/update)
{
  "name": "John Doe Updated",
  "email": "new@example.com",
  "is_active": false
}
```

**Catatan**:
- Audit logs untuk: login, logout, CRUD operations, role/permission changes
- Sensitive data (password) tidak disimpan di audit logs
- Partition table by month untuk performance (optional, untuk scale besar)

---

### 2.9 Table: password_resets

**Fungsi**: Token untuk password reset flow

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| user_id | BIGINT | NOT NULL | Foreign key ke users |
| token | VARCHAR(255) | NOT NULL | Reset token (hashed) |
| expires_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Token expiry (default: 1 hour) |
| used_at | TIMESTAMP WITH TIME ZONE | NULL | Timestamp token digunakan |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- UNIQUE: `token`

**Indexes**:
- `idx_password_resets_user_id` ON (user_id)
- `idx_password_resets_token` ON (token)
- `idx_password_resets_expires_at` ON (expires_at)

**No Soft Delete**: Token expired atau used langsung DELETE atau tandai `used_at`

**Password Reset Flow**:
1. User request reset → Generate token → Save to DB → Send email
2. User click link → Validate token (not expired, not used) → Allow password change
3. Password changed → Set `used_at = NOW()` atau DELETE token
4. Cleanup expired tokens dengan cron job (delete where `expires_at < NOW()`)

**Security**:
- Token harus di-hash sebelum disimpan (gunakan bcrypt atau SHA256)
- Token length: minimal 32 characters random string
- Token expiry: 1 hour (configurable)
- Invalidate semua tokens lama saat generate token baru untuk user yang sama

---

### 2.10 Table: categories

**Fungsi**: Master data categories (generic, bisa dipakai berbagai module)

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| parent_id | BIGINT | NULL | Parent category (untuk nested categories) |
| name | VARCHAR(255) | NOT NULL | Category name |
| slug | VARCHAR(255) | NOT NULL | URL-friendly slug |
| description | TEXT | NULL | Category description |
| type | VARCHAR(50) | NOT NULL | Category type (untuk group berbeda categories) |
| order | INTEGER | NOT NULL | Display order (default: 0) |
| is_active | BOOLEAN | NOT NULL | Active status (default: true) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp updated |
| created_by | BIGINT | NULL | User ID yang create |
| updated_by | BIGINT | NULL | User ID yang update |
| deleted_at | TIMESTAMP WITH TIME ZONE | NULL | Soft delete timestamp |
| deleted_by | BIGINT | NULL | User ID yang delete |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `parent_id` REFERENCES `categories(id)` ON DELETE CASCADE
- FOREIGN KEY: `created_by` REFERENCES `users(id)` ON DELETE SET NULL
- FOREIGN KEY: `updated_by` REFERENCES `users(id)` ON DELETE SET NULL
- UNIQUE: `(slug, type)` (per tenant schema)

**Indexes**:
- `idx_categories_parent_id` ON (parent_id)
- `idx_categories_slug` ON (slug)
- `idx_categories_type` ON (type)
- `idx_categories_order` ON (order)
- `idx_categories_deleted_at` ON (deleted_at) WHERE deleted_at IS NULL

**Soft Delete**: ✅ Yes (protect dari accidental deletion)

**Catatan**:
- `type` digunakan untuk group berbeda jenis categories (e.g., 'content', 'product', 'document')
- Nested categories: gunakan `parent_id` (max 3 levels recommended untuk UI)
- Query nested categories: gunakan recursive CTE (WITH RECURSIVE)

**Contoh Data**:
```
type: 'content', name: 'Berita', slug: 'berita'
type: 'content', name: 'Pengumuman', slug: 'pengumuman'
type: 'document', name: 'SOP', slug: 'sop'
type: 'document', name: 'Laporan', slug: 'laporan'
```

---

### 2.11 Table: tags

**Fungsi**: Master data tags (generic, untuk tagging berbagai resources)

**Kolom**:

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| id | BIGSERIAL | NOT NULL | Primary key |
| name | VARCHAR(100) | NOT NULL | Tag name |
| slug | VARCHAR(100) | NOT NULL | URL-friendly slug |
| color | VARCHAR(7) | NULL | Hex color code (e.g., '#3B82F6') |
| description | TEXT | NULL | Tag description |
| usage_count | INTEGER | NOT NULL | Berapa kali tag digunakan (default: 0) |
| is_active | BOOLEAN | NOT NULL | Active status (default: true) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp created |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Timestamp updated |
| created_by | BIGINT | NULL | User ID yang create |
| updated_by | BIGINT | NULL | User ID yang update |
| deleted_at | TIMESTAMP WITH TIME ZONE | NULL | Soft delete timestamp |
| deleted_by | BIGINT | NULL | User ID yang delete |

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `slug` (per tenant schema)
- FOREIGN KEY: `created_by` REFERENCES `users(id)` ON DELETE SET NULL
- FOREIGN KEY: `updated_by` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes**:
- `idx_tags_slug` ON (slug)
- `idx_tags_name` ON (name)
- `idx_tags_usage_count` ON (usage_count)
- `idx_tags_deleted_at` ON (deleted_at) WHERE deleted_at IS NULL

**Soft Delete**: ✅ Yes (protect dari accidental deletion)

**Catatan**:
- Tags bersifat flat (tidak nested seperti categories)
- `usage_count` di-increment/decrement saat tag di-assign/unassign ke resource
- Tags bisa digunakan untuk: content tagging, user skills, document classification
- Polymorphic relationship: gunakan junction table per resource type
  - Example: `content_tags(content_id, tag_id)`
  - Example: `document_tags(document_id, tag_id)`

**Contoh Data**:
```
name: 'Urgent', slug: 'urgent', color: '#EF4444' (red)
name: 'Important', slug: 'important', color: '#F59E0B' (yellow)
name: 'Review', slug: 'review', color: '#3B82F6' (blue)
```

---

## 3. Relasi Antar Tabel

### 3.1 Global Schema Relationships

```
modules (1) ──< (N) module_permissions
   │
   │ (referenced by tenant schema)
   │
   └──< (N) tenant_modules (in each tenant schema)

tenants (1:1 with tenant schema)
```

**Keterangan**:
- `modules` → `module_permissions`: One module has many permissions template
- `modules` → `tenant_modules`: One module can be enabled in many tenants (cross-schema FK)
- `tenants`: Setiap tenant punya dedicated schema (`tenant_xxx`)

---

### 3.2 Tenant Schema Relationships

```
users (1) ──< (N) user_roles ──> (N) roles (1) ──< (N) role_permissions ──> (N) permissions
  │                                   │
  │                                   └──< (N) audit_logs (created_by, updated_by, deleted_by)
  │
  ├──< (N) sessions
  ├──< (N) password_resets
  ├──< (N) audit_logs (user_id)
  └──< (N) tenant_modules (enabled_by, disabled_by)

categories (1) ──< (N) categories (self-referencing: parent_id)

tags (standalone, referenced by junction tables in app-specific modules)

public.modules (1) ──< (N) tenant_modules
```

**Many-to-Many Relationships**:
- `users` ↔ `roles` via `user_roles`
- `roles` ↔ `permissions` via `role_permissions`
- Application resources ↔ `tags` via app-specific junction tables

**Self-Referencing**:
- `categories.parent_id` → `categories.id` (nested categories)

**Cross-Schema FK**:
- `tenant_modules.module_id` → `public.modules.id`

---

### 3.3 ERD Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GLOBAL SCHEMA (public)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐         ┌────────────────────┐                        │
│  │ tenants  │         │ modules            │                        │
│  ├──────────┤         ├────────────────────┤                        │
│  │ id (PK)  │         │ id (PK)            │                        │
│  │ name     │         │ name (UK)          │                        │
│  │ slug(UK) │         │ display_name       │                        │
│  │ schema   │         │ route_prefix (UK)  │                        │
│  └──────────┘         │ is_core            │                        │
│                       └──────────┬─────────┘                        │
│                                  │                                   │
│                                  │ 1:N                               │
│                                  ▼                                   │
│                       ┌────────────────────┐                        │
│                       │ module_permissions │                        │
│                       ├────────────────────┤                        │
│                       │ id (PK)            │                        │
│                       │ module_id (FK)     │                        │
│                       │ resource           │                        │
│                       │ action             │                        │
│                       │ scope              │                        │
│                       └────────────────────┘                        │
│                                                                       │
│  ┌──────────────────┐                                               │
│  │ system_settings  │                                               │
│  ├──────────────────┤                                               │
│  │ id (PK)          │                                               │
│  │ key (UK)         │                                               │
│  │ value            │                                               │
│  │ type             │                                               │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    TENANT SCHEMA (tenant_xxx)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────┐                                                      │
│  │   users    │                                                      │
│  ├────────────┤                                                      │
│  │ id (PK)    │────┐                                                │
│  │ email (UK) │    │                                                │
│  │ name       │    │ 1:N                                            │
│  │*deleted_at │    │                                                │
│  └────────────┘    │                                                │
│        │           ▼                                                │
│        │    ┌──────────────┐        ┌───────────┐                  │
│        │    │ user_roles   │        │  roles    │                  │
│        │    ├──────────────┤        ├───────────┤                  │
│        │    │ id (PK)      │───────>│ id (PK)   │                  │
│        └───>│ user_id (FK) │        │ name (UK) │──┐               │
│             │ role_id (FK) │<───────│*deleted_at│  │               │
│             └──────────────┘        └───────────┘  │ 1:N           │
│                                           │         │               │
│                                           │ 1:N     ▼               │
│                                           │  ┌─────────────────┐   │
│                                           │  │role_permissions │   │
│                                           │  ├─────────────────┤   │
│                                           └─>│ id (PK)         │   │
│                                              │ role_id (FK)    │   │
│  ┌────────────────┐                         │ permission_id   │   │
│  │ tenant_modules │                         └────────┬────────┘   │
│  ├────────────────┤                                  │             │
│  │ id (PK)        │                                  ▼             │
│  │ module_id (FK) │──> public.modules      ┌──────────────┐      │
│  │ is_enabled     │                         │ permissions  │      │
│  │ config (JSONB) │                         ├──────────────┤      │
│  └────────────────┘                         │ id (PK)      │      │
│                                              │ resource     │      │
│  ┌─────────────┐       ┌──────────────┐    │ action       │      │
│  │  sessions   │       │ audit_logs   │    │ scope        │      │
│  ├─────────────┤       ├──────────────┤    └──────────────┘      │
│  │ id (PK)     │       │ id (PK)      │                           │
│  │ user_id(FK) │──┐    │ user_id (FK) │                           │
│  │ payload     │  │    │ action       │                           │
│  │ expires_at  │  │    │ resource     │                           │
│  └─────────────┘  │    │ old_values   │                           │
│                   │    │ new_values   │                           │
│  ┌────────────────┐│    └──────────────┘                           │
│  │password_resets ││                                               │
│  ├────────────────┤│    ┌────────────┐                            │
│  │ id (PK)        ││    │ categories │                            │
│  │ user_id (FK)   │└──> ├────────────┤                            │
│  │ token (UK)     │     │ id (PK)    │───┐ self-ref               │
│  │ expires_at     │     │ parent_id  │<──┘ (nested)               │
│  │ used_at        │     │ name       │                            │
│  └────────────────┘     │ slug (UK)  │                            │
│                         │ type       │                            │
│                         │*deleted_at │                            │
│                         └────────────┘                            │
│                                                                     │
│                         ┌──────────┐                              │
│                         │  tags    │                              │
│                         ├──────────┤                              │
│                         │ id (PK)  │                              │
│                         │ name     │                              │
│                         │ slug(UK) │                              │
│                         │ color    │                              │
│                         │*deleted_at│                             │
│                         └──────────┘                              │
│                               │                                    │
│                               └─> (referenced by app junction      │
│                                    tables: content_tags, etc)      │
└─────────────────────────────────────────────────────────────────────┘

Legend:
- (PK) = Primary Key
- (FK) = Foreign Key
- (UK) = Unique Key
- *deleted_at = Soft Delete support
- 1:N = One-to-Many relationship
- N:M = Many-to-Many (via junction table)
```

---

## 4. Status dan Enum Definitions

### 4.1 Subscription Tiers (tenants)

```typescript
enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}
```

**Limits per tier** (disimpan di `tenants.config.features`):
- **FREE**: 10 users, 1GB storage, 3 modules
- **BASIC**: 50 users, 10GB storage, 10 modules
- **PRO**: 200 users, 100GB storage, unlimited modules
- **ENTERPRISE**: unlimited users, unlimited storage, unlimited modules

---

### 4.2 Permission Actions (permissions, module_permissions)

```typescript
enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',  // untuk approval flow
  REJECT = 'reject'     // untuk approval flow
}
```

---

### 4.3 Permission Scopes (permissions, module_permissions)

```typescript
enum PermissionScope {
  OWN = 'own',       // Hanya data sendiri
  TENANT = 'tenant', // Semua data dalam tenant
  ALL = 'all'        // Semua data (super admin only)
}
```

**Contoh kombinasi**:
- `users.read.own` → User bisa baca profil sendiri
- `users.read.tenant` → User bisa baca semua users dalam tenant
- `users.update.own` → User bisa update profil sendiri
- `users.delete.tenant` → User bisa delete users dalam tenant (admin)

---

### 4.4 Audit Log Actions (audit_logs)

```typescript
enum AuditAction {
  CREATE = 'create',
  READ = 'read',     // optional, untuk sensitive data
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject'
}
```

---

### 4.5 System Settings Types (system_settings)

```typescript
enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json'
}
```

---

## 5. Indexing Strategy

### 5.1 Primary Indexes (Sudah Defined di Table)

Setiap tabel sudah punya indexes untuk:
- Primary Keys (automatic)
- Unique Keys (automatic)
- Foreign Keys (manual, untuk JOIN performance)
- Soft Delete columns (`deleted_at WHERE deleted_at IS NULL`)
- Search fields (`email`, `name`, `slug`)
- Filter fields (`is_active`, `is_enabled`, `type`)

### 5.2 Composite Indexes (Recommended untuk Query Pattern)

**users table**:
```sql
CREATE INDEX idx_users_active_not_deleted 
ON users(is_active, deleted_at) 
WHERE deleted_at IS NULL;
```

**audit_logs table**:
```sql
-- Query pattern: Filter by resource + time range
CREATE INDEX idx_audit_logs_resource_time 
ON audit_logs(resource, resource_id, created_at DESC);

-- Query pattern: Filter by user + time range
CREATE INDEX idx_audit_logs_user_time 
ON audit_logs(user_id, created_at DESC);
```

**sessions table**:
```sql
-- Query pattern: Find active sessions for user
CREATE INDEX idx_sessions_user_active 
ON sessions(user_id, expires_at) 
WHERE expires_at > NOW();
```

### 5.3 Full-Text Search (Optional untuk Production)

**users table**:
```sql
-- Untuk search by name or email
CREATE INDEX idx_users_search 
ON users USING gin(to_tsvector('english', name || ' ' || email))
WHERE deleted_at IS NULL;
```

**Cara query**:
```sql
SELECT * FROM users 
WHERE to_tsvector('english', name || ' ' || email) @@ to_tsquery('english', 'john');
```

### 5.4 JSONB Indexes (Untuk Config dan Payload)

**tenants.config**:
```sql
-- Untuk query by subscription tier di config
CREATE INDEX idx_tenants_config_tier 
ON tenants USING gin(config jsonb_path_ops);
```

**sessions.payload**:
```sql
-- Untuk query sessions by role di payload
CREATE INDEX idx_sessions_payload 
ON sessions USING gin(payload jsonb_path_ops);
```

### 5.5 Partial Indexes (Untuk Conditional Queries)

```sql
-- Index hanya untuk active tenants
CREATE INDEX idx_tenants_active 
ON tenants(slug) 
WHERE is_active = true AND deleted_at IS NULL;

-- Index hanya untuk verified users
CREATE INDEX idx_users_verified 
ON users(email) 
WHERE is_verified = true AND deleted_at IS NULL;
```

---

## 6. Soft Delete Implementation

### 6.1 Tables dengan Soft Delete

✅ **Wajib Soft Delete**:
- `tenants` - Data tenant sangat krusial
- `users` - User history penting untuk audit
- `roles` - Protect dari accidental deletion
- `categories` - Master data reference
- `tags` - Master data reference

❌ **Tidak Perlu Soft Delete**:
- `modules` - Global reference, cukup set `is_active = false`
- `module_permissions` - Reference data
- `permissions` - Reference data
- `user_roles` - Junction table
- `role_permissions` - Junction table
- `tenant_modules` - Cukup toggle `is_enabled`
- `sessions` - Temporary data
- `audit_logs` - Immutable, never deleted
- `password_resets` - Temporary data
- `system_settings` - Configuration data

### 6.2 Soft Delete Columns

Semua tabel dengan soft delete harus punya:
```sql
deleted_at TIMESTAMP WITH TIME ZONE NULL
deleted_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL
```

### 6.3 Soft Delete Query Pattern

**Insert**:
```sql
-- Normal insert, deleted_at = NULL
INSERT INTO users (email, name, ...) VALUES (...);
```

**Soft Delete**:
```sql
-- Set deleted_at dan deleted_by
UPDATE users 
SET deleted_at = NOW(), deleted_by = :current_user_id
WHERE id = :user_id;
```

**Restore**:
```sql
-- Set deleted_at kembali ke NULL
UPDATE users 
SET deleted_at = NULL, deleted_by = NULL
WHERE id = :user_id;
```

**List (exclude deleted)**:
```sql
-- Tambahkan filter deleted_at IS NULL
SELECT * FROM users 
WHERE deleted_at IS NULL;
```

**List (include deleted)**:
```sql
-- Tanpa filter deleted_at (untuk audit/recovery)
SELECT * FROM users;
```

### 6.4 Drizzle ORM Integration

**Schema definition**:
```typescript
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  // ... other columns
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: bigint('deleted_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'set null' }),
});
```

**Soft delete scope (default)**:
```typescript
// Create reusable query helper
export const activeUsers = db.$with('active_users').as(
  db.select().from(users).where(isNull(users.deletedAt))
);

// Usage
const result = await db.with(activeUsers).select().from(activeUsers);
```

---

## 7. Audit Log Implementation

### 7.1 Actions yang Harus Di-Audit

**User Management**:
- Login/Logout
- Create/Update/Delete user
- Change password
- Assign/Revoke role

**Role & Permission Management**:
- Create/Update/Delete role
- Assign/Revoke permission to role

**Master Data**:
- Create/Update/Delete categories
- Create/Update/Delete tags

**Tenant Management** (di global schema):
- Create/Update/Delete tenant
- Enable/Disable module

**Application-Specific** (tergantung use case):
- Create/Update/Delete content
- Approve/Reject workflow
- Export data
- Import data

### 7.2 Audit Log Capture Pattern

**NestJS Interceptor** (automatic):
```typescript
@Injectable()
export class AuditInterceptor implements NestExecutionContext {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { method, url, body } = request;
    
    // Capture before state (for update/delete)
    const oldValues = await this.getOldValues(method, body);
    
    // Execute handler
    const result = await next.handle().toPromise();
    
    // Capture after state (for create/update)
    const newValues = await this.getNewValues(result);
    
    // Save audit log
    await this.auditService.log({
      userId: user.id,
      action: this.mapMethodToAction(method),
      resource: this.extractResource(url),
      resourceId: result.id,
      oldValues,
      newValues,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
    
    return result;
  }
}
```

**Manual Audit** (untuk complex operations):
```typescript
// In service method
async deleteUser(userId: number, deletedBy: number) {
  const user = await this.findById(userId);
  
  // Soft delete
  await this.usersRepo.update(userId, {
    deletedAt: new Date(),
    deletedBy,
  });
  
  // Audit log
  await this.auditService.log({
    userId: deletedBy,
    action: 'delete',
    resource: 'users',
    resourceId: userId,
    oldValues: { ...user },
    newValues: null,
    ipAddress: this.request.ip,
    userAgent: this.request.headers['user-agent'],
  });
}
```

### 7.3 Sensitive Data di Audit Logs

**❌ JANGAN simpan**:
- `password` atau `password_hash`
- `token` atau `secret_key`
- Credit card numbers
- SSN atau ID numbers

**✅ Simpan**:
- User profile changes (name, email)
- Role/permission changes
- Master data changes
- Application data changes

**Filter sensitive fields**:
```typescript
function sanitizeForAudit(data: any) {
  const sensitive = ['password', 'passwordHash', 'token', 'secretKey'];
  const sanitized = { ...data };
  
  sensitive.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}
```

### 7.4 Audit Log Retention

**Retention Policy**:
- **Production**: Keep 2 years (configurable)
- **Archive**: Move to cold storage after 1 year
- **Delete**: After 2 years (comply with GDPR/local regulations)

**Partition Strategy** (untuk scale besar):
```sql
-- Partition by month
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

---

## 8. Migration Strategy

### 8.1 Migration Order (MVP Phase 1)

**Week 1-2: Core Setup**
1. ✅ Create database `platform_cms`
2. ✅ Create global schema (`public`)
3. ✅ Migrate global tables: `tenants`, `modules`, `module_permissions`, `system_settings`
4. ✅ Seed default modules
5. ✅ Create tenant schema function (dynamic schema creation)

**Week 3-4: Tenant Setup**
6. ✅ Migrate tenant tables: `users`, `roles`, `permissions`, junction tables
7. ✅ Migrate tenant tables: `sessions`, `audit_logs`, `password_resets`
8. ✅ Migrate tenant tables: `categories`, `tags`
9. ✅ Migrate tenant table: `tenant_modules`
10. ✅ Seed default roles and permissions per tenant

**Week 5+: Application Tables**
11. Migrate application-specific tables (per use case)

### 8.2 Drizzle ORM Migration Commands

```bash
# Generate migration
npm run db:generate

# Run migration (global schema)
npm run db:migrate

# Run migration (specific tenant schema)
npm run db:migrate:tenant -- --schema=tenant_001

# Seed data
npm run db:seed
```

### 8.3 Tenant Schema Creation Function

**PostgreSQL Function**:
```sql
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_slug VARCHAR)
RETURNS VOID AS $$
DECLARE
  schema_name VARCHAR := 'tenant_' || tenant_slug;
BEGIN
  -- Create schema
  EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || schema_name;
  
  -- Set search path
  EXECUTE 'SET search_path TO ' || schema_name || ', public';
  
  -- Create all tenant tables (run migrations)
  -- This will be handled by Drizzle ORM migration
  
  -- Seed default data (roles, permissions)
  -- This will be handled by seed script
END;
$$ LANGUAGE plpgsql;
```

**Usage**:
```sql
-- Create new tenant schema
SELECT create_tenant_schema('acme_corp');

-- Result: schema 'tenant_acme_corp' created with all tables
```

---

## 9. Security Considerations

### 9.1 Database Level

✅ **Implemented**:
- Schema-based multi-tenancy (data isolation)
- Soft delete untuk data protection
- Foreign keys dengan ON DELETE CASCADE/SET NULL
- CHECK constraints untuk enum values
- UNIQUE constraints untuk business logic

🔐 **Recommended**:
- Row-Level Security (RLS) untuk extra layer protection
- Database roles: `app_admin`, `app_user` (least privilege)
- Encrypted connections (SSL/TLS)
- Database audit logging (PostgreSQL log)

### 9.2 Application Level

**Input Sanitization**:
- Drizzle ORM (parameterized queries) ✅ SQL injection prevention
- Class-validator (DTO validation) ✅ Input validation
- Helmet.js ✅ XSS prevention

**Output Sanitization**:
- DOMPurify untuk HTML content
- JSON response validation
- Error messages (jangan expose internal details)

**Authentication & Authorization**:
- JWT tokens (access + refresh)
- Bcrypt password hashing (cost factor: 12)
- Rate limiting (login attempts, API requests)
- RBAC dengan permissions check di setiap endpoint

---

## 10. Performance Optimization

### 10.1 Query Optimization

✅ **Already Implemented**:
- Indexes pada FK, search fields, filter fields
- Composite indexes untuk common query patterns
- Partial indexes untuk conditional queries

🚀 **Future Optimization**:
- Query result caching (Redis)
- Connection pooling (pgBouncer)
- Read replicas untuk reporting queries
- Materialized views untuk complex aggregations

### 10.2 Data Volume Management

**Audit Logs**:
- Partition by month
- Archive old data (> 1 year) to cold storage
- Delete very old data (> 2 years)

**Sessions**:
- Primary storage: Redis (fast access)
- PostgreSQL: Backup only
- Cleanup expired sessions (cron job)

**Soft Deleted Records**:
- Archive after 6 months
- Permanent delete after 2 years (optional)

---

## 11. Checklist Implementation

### Phase 1: Core Tables (Week 1-4)

- [ ] Setup PostgreSQL database
- [ ] Configure Drizzle ORM
- [ ] Create global schema migrations
- [ ] Create tenant schema migrations
- [ ] Implement soft delete mechanism
- [ ] Implement audit log interceptor
- [ ] Seed default modules
- [ ] Seed default roles & permissions
- [ ] Create tenant schema function
- [ ] Test multi-tenancy isolation

### Phase 2: Security & Performance (Week 5-8)

- [ ] Implement RLS (optional)
- [ ] Setup connection pooling
- [ ] Setup Redis for sessions
- [ ] Setup query caching
- [ ] Implement rate limiting
- [ ] Security audit
- [ ] Performance testing

### Phase 3: Monitoring & Maintenance (Week 9+)

- [ ] Setup database monitoring
- [ ] Setup slow query log
- [ ] Implement backup strategy
- [ ] Implement audit log archival
- [ ] Implement session cleanup cron
- [ ] Document database operations

---

## 12. Referensi

### Internal Documents
- `PROJECT-BRIEF.md` - Project overview & single source of truth
- `PRD.md` - Product requirements & user stories
- `FEATURE-LIST.md` - Complete feature breakdown
- `USER-FLOW.md` - User journeys & flows

### External References
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Drizzle ORM Documentation: https://orm.drizzle.team/
- Multi-Tenancy Best Practices: Schema-based isolation
- GDPR Compliance: Data retention & deletion policies

---

**END OF DOCUMENT**

**Document Created**: 2024-01-08  
**Last Updated**: 2024-01-08  
**Version**: 1.0  
**Status**: ✅ Complete - Ready for Implementation

