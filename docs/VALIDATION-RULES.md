# VALIDATION RULES
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Validation Specification  
**Reference**: PRD.md, FEATURE-LIST.md, ERD-DATABASE.md, API-CONTRACT.md, BUSINESS-RULES.md

---

## Pendahuluan

Dokumen ini berisi aturan validasi detail untuk setiap form dan endpoint di Platform CMS. Validasi dilakukan di 2 layer:

1. **Frontend Validation** - Real-time feedback untuk UX (React Hook Form + Zod)
2. **Backend Validation** - Security dan data integrity (Zod schemas + custom validators)

**Format Error Message**:
- Bahasa Indonesia
- Jelas dan actionable
- Per-field, BUKAN bundled

**Validation Priority**:
1. Required fields
2. Data type dan format
3. Length/size constraints
4. Business rules
5. Uniqueness
6. Foreign key constraints

---

## 1. Validasi Authentication

### 1.1 Register User

**Endpoint**: `POST /api/v1/auth/register`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| email | Required | Email wajib diisi | - |
| email | Valid email format | Format email tidak valid | RFC 5322 standard |
| email | Max 255 characters | Email maksimal 255 karakter | Sesuai ERD VARCHAR(255) |
| email | Unique in tenant | Email sudah terdaftar | Check di database per tenant |
| email | Lowercase conversion | - | Auto convert ke lowercase |
| password | Required | Password wajib diisi | - |
| password | Min 8 characters | Password minimal 8 karakter | Security requirement |
| password | Max 255 characters | Password maksimal 255 karakter | Reasonable limit |
| password | Contains uppercase | Password harus mengandung huruf besar | Min 1 uppercase |
| password | Contains lowercase | Password harus mengandung huruf kecil | Min 1 lowercase |
| password | Contains number | Password harus mengandung angka | Min 1 digit |
| password | Not same as email | Password tidak boleh sama dengan email | Security best practice |
| name | Required | Nama lengkap wajib diisi | - |
| name | Min 2 characters | Nama minimal 2 karakter | - |
| name | Max 255 characters | Nama maksimal 255 karakter | Sesuai ERD |
| name | Valid characters | Nama hanya boleh huruf, spasi, dan tanda petik | Pattern: ^[a-zA-Z\s']+$ |
| phone | Optional | - | Boleh kosong |
| phone | Valid phone format | Format nomor telepon tidak valid | E.164 format preferred |
| phone | Max 20 characters | Nomor telepon maksimal 20 karakter | Sesuai ERD |
| phone | Starts with + or 0 | Nomor telepon harus diawali + atau 0 | Indonesian/International |

**Regex Patterns**:
```javascript
email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
name: /^[a-zA-Z\s']+$/
phone: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
```

---

### 1.2 Login User

**Endpoint**: `POST /api/v1/auth/login`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| email | Required | Email wajib diisi | - |
| email | Valid email format | Format email tidak valid | - |
| email | Max 255 characters | Email maksimal 255 karakter | - |
| password | Required | Password wajib diisi | - |
| password | Min 1 character | Password tidak boleh kosong | Don't reveal min length |
| password | Max 255 characters | Password terlalu panjang | Prevent DOS attack |

**Business Validations** (setelah input validation):
- User exists: "Email atau password salah" (generic message for security)
- Password match: "Email atau password salah" (generic message for security)
- User is_active: "Akun Anda tidak aktif. Hubungi administrator."
- Tenant is_active: "Tenant tidak aktif. Hubungi administrator."
- Rate limit: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit."

---

### 1.3 Password Reset Request

**Endpoint**: `POST /api/v1/auth/password-reset/request`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| email | Required | Email wajib diisi | - |
| email | Valid email format | Format email tidak valid | - |
| email | Max 255 characters | Email maksimal 255 karakter | - |

**Business Validations**:
- User exists: Always return success (security - don't reveal if email exists)
- Success message: "Link reset password telah dikirim ke email Anda"

---

### 1.4 Password Reset Confirm

**Endpoint**: `POST /api/v1/auth/password-reset/confirm`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| token | Required | Token wajib diisi | - |
| token | Min 32 characters | Token tidak valid | Token length validation |
| token | Max 255 characters | Token tidak valid | - |
| password | Required | Password baru wajib diisi | - |
| password | Min 8 characters | Password minimal 8 karakter | - |
| password | Max 255 characters | Password maksimal 255 karakter | - |
| password | Contains uppercase | Password harus mengandung huruf besar | - |
| password | Contains lowercase | Password harus mengandung huruf kecil | - |
| password | Contains number | Password harus mengandung angka | - |

**Business Validations**:
- Token exists: "Token tidak valid atau sudah expired"
- Token not expired: "Token tidak valid atau sudah expired"
- Token not used: "Token sudah digunakan"

---

### 1.5 Change Password

**Endpoint**: `POST /api/v1/auth/password/change`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| oldPassword | Required | Password lama wajib diisi | - |
| oldPassword | Min 1 character | Password lama tidak boleh kosong | - |
| newPassword | Required | Password baru wajib diisi | - |
| newPassword | Min 8 characters | Password baru minimal 8 karakter | - |
| newPassword | Max 255 characters | Password baru maksimal 255 karakter | - |
| newPassword | Contains uppercase | Password baru harus mengandung huruf besar | - |
| newPassword | Contains lowercase | Password baru harus mengandung huruf kecil | - |
| newPassword | Contains number | Password baru harus mengandung angka | - |
| newPassword | Different from old | Password baru harus berbeda dengan password lama | - |

**Business Validations**:
- Old password match: "Password lama tidak sesuai"
- New password not in history: "Password ini sudah pernah digunakan sebelumnya" (Phase 2)

---

## 2. Validasi User Management

### 2.1 Create User

**Endpoint**: `POST /api/v1/users`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| email | Required | Email wajib diisi | - |
| email | Valid email format | Format email tidak valid | - |
| email | Max 255 characters | Email maksimal 255 karakter | - |
| email | Unique in tenant | Email sudah terdaftar | Check dalam tenant yang sama |
| email | Lowercase conversion | - | Auto convert |
| password | Optional | - | Jika kosong, generate otomatis |
| password | Min 8 characters (if provided) | Password minimal 8 karakter | - |
| password | Max 255 characters | Password maksimal 255 karakter | - |
| password | Contains uppercase (if provided) | Password harus mengandung huruf besar | - |
| password | Contains lowercase (if provided) | Password harus mengandung huruf kecil | - |
| password | Contains number (if provided) | Password harus mengandung angka | - |
| name | Required | Nama lengkap wajib diisi | - |
| name | Min 2 characters | Nama minimal 2 karakter | - |
| name | Max 255 characters | Nama maksimal 255 karakter | - |
| name | Valid characters | Nama hanya boleh huruf, spasi, dan tanda petik | - |
| phone | Optional | - | - |
| phone | Valid phone format (if provided) | Format nomor telepon tidak valid | - |
| phone | Max 20 characters | Nomor telepon maksimal 20 karakter | - |
| roleIds | Required | Role wajib dipilih | - |
| roleIds | Array of integers | Format role tidak valid | - |
| roleIds | Min 1 item | Minimal pilih 1 role | - |
| roleIds | Valid role IDs | Role tidak valid | Check ke database |
| roleIds | Roles exist in tenant | Role tidak ditemukan | - |

---

### 2.2 Update User

**Endpoint**: `PUT /api/v1/users/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID user wajib diisi | - |
| id (URL param) | Valid integer | ID user tidak valid | - |
| id (URL param) | User exists | User tidak ditemukan | - |
| name | Optional | - | Jika tidak ada, tidak diupdate |
| name | Min 2 characters (if provided) | Nama minimal 2 karakter | - |
| name | Max 255 characters | Nama maksimal 255 karakter | - |
| name | Valid characters | Nama hanya boleh huruf, spasi, dan tanda petik | - |
| phone | Optional | - | - |
| phone | Valid phone format (if provided) | Format nomor telepon tidak valid | - |
| phone | Max 20 characters | Nomor telepon maksimal 20 karakter | - |
| avatarUrl | Optional | - | - |
| avatarUrl | Valid URL (if provided) | Format URL tidak valid | - |
| avatarUrl | Max 500 characters | URL avatar maksimal 500 karakter | - |
| email | Not allowed | Email tidak dapat diubah | Email immutable |

**Business Validations**:
- Permission check: Own data (users.update.own) or tenant data (users.update.tenant)
- User not deleted: "User tidak ditemukan"

---

### 2.3 Delete User (Soft Delete)

**Endpoint**: `DELETE /api/v1/users/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID user wajib diisi | - |
| id (URL param) | Valid integer | ID user tidak valid | - |
| id (URL param) | User exists | User tidak ditemukan | - |
| id (URL param) | Not deleting self | Anda tidak dapat menghapus akun sendiri | Prevent self-deletion |

**Business Validations**:
- Permission check: users.delete.tenant
- User not already deleted: "User sudah dihapus"

---

### 2.4 Restore User

**Endpoint**: `POST /api/v1/users/:id/restore`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID user wajib diisi | - |
| id (URL param) | Valid integer | ID user tidak valid | - |
| id (URL param) | User exists (include deleted) | User tidak ditemukan | - |

**Business Validations**:
- User is deleted: "User tidak dalam status terhapus"
- Permission check: users.delete.tenant (same as delete)

---

### 2.5 Activate/Deactivate User

**Endpoint**: `PATCH /api/v1/users/:id/status`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID user wajib diisi | - |
| id (URL param) | Valid integer | ID user tidak valid | - |
| id (URL param) | User exists | User tidak ditemukan | - |
| id (URL param) | Not self | Anda tidak dapat mengubah status akun sendiri | Prevent self-deactivation |
| isActive | Required | Status wajib diisi | - |
| isActive | Boolean | Status harus berupa true atau false | - |

**Business Validations**:
- Permission check: users.update.tenant
- User not deleted: "User tidak ditemukan"

---

### 2.6 Assign Roles to User

**Endpoint**: `POST /api/v1/users/:id/roles`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID user wajib diisi | - |
| id (URL param) | Valid integer | ID user tidak valid | - |
| id (URL param) | User exists | User tidak ditemukan | - |
| roleIds | Required | Role wajib dipilih | - |
| roleIds | Array of integers | Format role tidak valid | - |
| roleIds | Min 1 item | Minimal pilih 1 role | User harus punya minimal 1 role |
| roleIds | Valid role IDs | Role tidak valid | - |
| roleIds | Roles exist in tenant | Role tidak ditemukan dalam tenant ini | - |

**Business Validations**:
- Permission check: users.update.tenant
- Cannot modify own roles: "Anda tidak dapat mengubah role sendiri"

---

## 3. Validasi Role Management

### 3.1 Create Role

**Endpoint**: `POST /api/v1/roles`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| name | Required | Nama role wajib diisi | - |
| name | Min 2 characters | Nama role minimal 2 karakter | - |
| name | Max 100 characters | Nama role maksimal 100 karakter | Sesuai ERD |
| name | Alphanumeric with dash/underscore | Nama role hanya boleh huruf, angka, dash, dan underscore | Pattern: ^[a-z0-9_-]+$ |
| name | Lowercase | Nama role harus lowercase | Auto convert atau validate |
| name | Unique in tenant | Nama role sudah ada | - |
| name | Not system role name | Nama role tidak boleh menggunakan nama system role | super_admin, admin, operator |
| displayName | Required | Nama tampilan wajib diisi | - |
| displayName | Min 2 characters | Nama tampilan minimal 2 karakter | - |
| displayName | Max 255 characters | Nama tampilan maksimal 255 karakter | - |
| description | Optional | - | - |
| description | Max 1000 characters (if provided) | Deskripsi maksimal 1000 karakter | Reasonable limit |

**Regex Patterns**:
```javascript
name: /^[a-z0-9_-]+$/
```

---

### 3.2 Update Role

**Endpoint**: `PUT /api/v1/roles/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID role wajib diisi | - |
| id (URL param) | Valid integer | ID role tidak valid | - |
| id (URL param) | Role exists | Role tidak ditemukan | - |
| name | Optional (system roles cannot change) | Nama role sistem tidak dapat diubah | Only for custom roles |
| name | Min 2 characters (if provided) | Nama role minimal 2 karakter | - |
| name | Max 100 characters | Nama role maksimal 100 karakter | - |
| name | Alphanumeric with dash/underscore | Nama role hanya boleh huruf, angka, dash, dan underscore | - |
| name | Unique in tenant (if changed) | Nama role sudah ada | - |
| displayName | Optional | - | - |
| displayName | Min 2 characters (if provided) | Nama tampilan minimal 2 karakter | - |
| displayName | Max 255 characters | Nama tampilan maksimal 255 karakter | - |
| description | Optional | - | - |
| description | Max 1000 characters (if provided) | Deskripsi maksimal 1000 karakter | - |

**Business Validations**:
- Permission check: roles.update.tenant
- Not system role (for name change): "Role sistem tidak dapat diubah"
- Role not deleted: "Role tidak ditemukan"

---

### 3.3 Delete Role (Soft Delete)

**Endpoint**: `DELETE /api/v1/roles/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID role wajib diisi | - |
| id (URL param) | Valid integer | ID role tidak valid | - |
| id (URL param) | Role exists | Role tidak ditemukan | - |

**Business Validations**:
- Permission check: roles.delete.tenant
- Not system role: "Role sistem tidak dapat dihapus"
- No users with this role: "Role tidak dapat dihapus karena masih ada user yang menggunakan role ini"
- Role not already deleted: "Role sudah dihapus"

---

### 3.4 Assign Permissions to Role

**Endpoint**: `POST /api/v1/roles/:id/permissions`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID role wajib diisi | - |
| id (URL param) | Valid integer | ID role tidak valid | - |
| id (URL param) | Role exists | Role tidak ditemukan | - |
| permissionIds | Required | Permission wajib dipilih | - |
| permissionIds | Array of integers | Format permission tidak valid | - |
| permissionIds | Min 0 items | - | Boleh empty array untuk revoke all |
| permissionIds | Valid permission IDs | Permission tidak valid | - |
| permissionIds | Permissions exist in tenant | Permission tidak ditemukan | - |

**Business Validations**:
- Permission check: roles.update.tenant
- Role not deleted: "Role tidak ditemukan"

---

## 4. Validasi Tenant Management

### 4.1 Create Tenant

**Endpoint**: `POST /api/v1/tenants`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| name | Required | Nama tenant wajib diisi | - |
| name | Min 2 characters | Nama tenant minimal 2 karakter | - |
| name | Max 255 characters | Nama tenant maksimal 255 karakter | Sesuai ERD |
| name | Valid characters | Nama tenant hanya boleh huruf, angka, spasi, dash, dan underscore | Pattern: ^[a-zA-Z0-9\s_-]+$ |
| domain | Optional | - | - |
| domain | Valid domain format (if provided) | Format domain tidak valid | Pattern: ^[a-z0-9\-\.]+$ |
| domain | Max 255 characters | Domain maksimal 255 karakter | - |
| domain | Unique (if provided) | Domain sudah digunakan | Check global uniqueness |
| domain | Lowercase | Domain harus lowercase | Auto convert |
| subscriptionTier | Required | Subscription tier wajib dipilih | - |
| subscriptionTier | Valid enum | Subscription tier tidak valid | Enum: free, basic, pro, enterprise |
| subscriptionExpiresAt | Optional | - | - |
| subscriptionExpiresAt | Valid ISO date (if provided) | Format tanggal tidak valid | ISO 8601 format |
| subscriptionExpiresAt | Future date (if provided) | Tanggal expiry harus di masa depan | - |
| adminEmail | Required | Email admin wajib diisi | For tenant admin user |
| adminEmail | Valid email format | Format email admin tidak valid | - |
| adminEmail | Max 255 characters | Email admin maksimal 255 karakter | - |
| adminName | Required | Nama admin wajib diisi | - |
| adminName | Min 2 characters | Nama admin minimal 2 karakter | - |
| adminName | Max 255 characters | Nama admin maksimal 255 karakter | - |

**Business Validations**:
- Permission check: tenants.create.all (Super Admin only)
- Slug auto-generated from name (lowercase, dash-separated)
- Schema name auto-generated: tenant_{slug}
- Schema name must be unique

**Regex Patterns**:
```javascript
name: /^[a-zA-Z0-9\s_-]+$/
domain: /^[a-z0-9\-\.]+$/
```

---

### 4.2 Update Tenant

**Endpoint**: `PUT /api/v1/tenants/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID tenant wajib diisi | - |
| id (URL param) | Valid integer | ID tenant tidak valid | - |
| id (URL param) | Tenant exists | Tenant tidak ditemukan | - |
| name | Optional | - | - |
| name | Min 2 characters (if provided) | Nama tenant minimal 2 karakter | - |
| name | Max 255 characters | Nama tenant maksimal 255 karakter | - |
| name | Valid characters | Nama tenant hanya boleh huruf, angka, spasi, dash, dan underscore | - |
| domain | Optional | - | - |
| domain | Valid domain format (if provided) | Format domain tidak valid | - |
| domain | Max 255 characters | Domain maksimal 255 karakter | - |
| domain | Unique (if provided) | Domain sudah digunakan | Exclude current tenant |
| subscriptionTier | Optional | - | - |
| subscriptionTier | Valid enum (if provided) | Subscription tier tidak valid | - |
| subscriptionExpiresAt | Optional | - | - |
| subscriptionExpiresAt | Valid ISO date (if provided) | Format tanggal tidak valid | - |
| config | Optional | - | JSONB field |
| config | Valid JSON (if provided) | Format konfigurasi tidak valid | - |
| slug | Not allowed | Slug tidak dapat diubah | Immutable |
| schemaName | Not allowed | Schema name tidak dapat diubah | Immutable |

**Business Validations**:
- Permission check: tenants.update.all or tenants.update.own
- Tenant not deleted: "Tenant tidak ditemukan"

---

### 4.3 Delete Tenant (Soft Delete)

**Endpoint**: `DELETE /api/v1/tenants/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID tenant wajib diisi | - |
| id (URL param) | Valid integer | ID tenant tidak valid | - |
| id (URL param) | Tenant exists | Tenant tidak ditemukan | - |

**Business Validations**:
- Permission check: tenants.delete.all (Super Admin only)
- Confirmation required: User must type tenant name to confirm
- Tenant not already deleted: "Tenant sudah dihapus"

---

### 4.4 Restore Tenant

**Endpoint**: `POST /api/v1/tenants/:id/restore`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID tenant wajib diisi | - |
| id (URL param) | Valid integer | ID tenant tidak valid | - |
| id (URL param) | Tenant exists (include deleted) | Tenant tidak ditemukan | - |

**Business Validations**:
- Permission check: tenants.delete.all (Super Admin only)
- Tenant is deleted: "Tenant tidak dalam status terhapus"

---

## 5. Validasi Master Data

### 5.1 Create Category

**Endpoint**: `POST /api/v1/categories`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| name | Required | Nama kategori wajib diisi | - |
| name | Min 2 characters | Nama kategori minimal 2 karakter | - |
| name | Max 255 characters | Nama kategori maksimal 255 karakter | Sesuai ERD |
| description | Optional | - | - |
| description | Max 1000 characters (if provided) | Deskripsi maksimal 1000 karakter | - |
| type | Required | Tipe kategori wajib diisi | - |
| type | Max 50 characters | Tipe kategori maksimal 50 karakter | Sesuai ERD |
| type | Alphanumeric with underscore | Tipe kategori hanya boleh huruf, angka, dan underscore | Pattern: ^[a-z0-9_]+$ |
| parentId | Optional | - | For nested categories |
| parentId | Valid integer (if provided) | ID parent tidak valid | - |
| parentId | Parent exists (if provided) | Parent kategori tidak ditemukan | - |
| parentId | Not self-reference | Kategori tidak boleh menjadi parent dari dirinya sendiri | - |
| parentId | Max depth 3 levels | Maksimal 3 level nested kategori | Prevent deep nesting |
| order | Optional | - | Display order |
| order | Integer (if provided) | Order harus berupa angka | - |
| order | Min 0 (if provided) | Order minimal 0 | - |

**Business Validations**:
- Permission check: categories.create.tenant
- Slug auto-generated from name (lowercase, dash-separated)
- Slug unique per tenant and type: "Kategori dengan nama ini sudah ada dalam tipe yang sama"
- Parent category must be same type: "Parent kategori harus memiliki tipe yang sama"

**Regex Patterns**:
```javascript
type: /^[a-z0-9_]+$/
```

---

### 5.2 Update Category

**Endpoint**: `PUT /api/v1/categories/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID kategori wajib diisi | - |
| id (URL param) | Valid integer | ID kategori tidak valid | - |
| id (URL param) | Category exists | Kategori tidak ditemukan | - |
| name | Optional | - | - |
| name | Min 2 characters (if provided) | Nama kategori minimal 2 karakter | - |
| name | Max 255 characters | Nama kategori maksimal 255 karakter | - |
| description | Optional | - | - |
| description | Max 1000 characters (if provided) | Deskripsi maksimal 1000 karakter | - |
| type | Optional | - | - |
| type | Valid format (if provided) | Tipe kategori tidak valid | - |
| parentId | Optional | - | - |
| parentId | Valid integer (if provided) | ID parent tidak valid | - |
| parentId | Parent exists (if provided) | Parent kategori tidak ditemukan | - |
| parentId | Not self-reference | Kategori tidak boleh menjadi parent dari dirinya sendiri | - |
| parentId | Not circular reference | Circular reference tidak diperbolehkan | Check descendants |
| order | Optional | - | - |
| order | Integer (if provided) | Order harus berupa angka | - |

**Business Validations**:
- Permission check: categories.update.tenant
- Category not deleted: "Kategori tidak ditemukan"
- Slug re-generated if name changed

---

### 5.3 Delete Category (Soft Delete)

**Endpoint**: `DELETE /api/v1/categories/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID kategori wajib diisi | - |
| id (URL param) | Valid integer | ID kategori tidak valid | - |
| id (URL param) | Category exists | Kategori tidak ditemukan | - |

**Business Validations**:
- Permission check: categories.delete.tenant
- No children categories: "Kategori tidak dapat dihapus karena masih memiliki sub-kategori"
- Category not already deleted: "Kategori sudah dihapus"

---

### 5.4 Create Tag

**Endpoint**: `POST /api/v1/tags`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| name | Required | Nama tag wajib diisi | - |
| name | Min 2 characters | Nama tag minimal 2 karakter | - |
| name | Max 100 characters | Nama tag maksimal 100 karakter | Sesuai ERD |
| name | Valid characters | Nama tag hanya boleh huruf, angka, spasi, dash, dan underscore | Pattern: ^[a-zA-Z0-9\s_-]+$ |
| description | Optional | - | - |
| description | Max 500 characters (if provided) | Deskripsi maksimal 500 karakter | - |
| color | Optional | - | Hex color code |
| color | Valid hex color (if provided) | Format warna tidak valid | Pattern: ^#[0-9A-Fa-f]{6}$ |

**Business Validations**:
- Permission check: tags.create.tenant
- Slug auto-generated from name (lowercase, dash-separated)
- Slug unique per tenant: "Tag dengan nama ini sudah ada"
- Default color if not provided: #3B82F6 (blue)

**Regex Patterns**:
```javascript
name: /^[a-zA-Z0-9\s_-]+$/
color: /^#[0-9A-Fa-f]{6}$/
```

---

### 5.5 Update Tag

**Endpoint**: `PUT /api/v1/tags/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID tag wajib diisi | - |
| id (URL param) | Valid integer | ID tag tidak valid | - |
| id (URL param) | Tag exists | Tag tidak ditemukan | - |
| name | Optional | - | - |
| name | Min 2 characters (if provided) | Nama tag minimal 2 karakter | - |
| name | Max 100 characters | Nama tag maksimal 100 karakter | - |
| description | Optional | - | - |
| description | Max 500 characters (if provided) | Deskripsi maksimal 500 karakter | - |
| color | Optional | - | - |
| color | Valid hex color (if provided) | Format warna tidak valid | - |

**Business Validations**:
- Permission check: tags.update.tenant
- Tag not deleted: "Tag tidak ditemukan"
- Slug re-generated if name changed

---

### 5.6 Delete Tag (Soft Delete)

**Endpoint**: `DELETE /api/v1/tags/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID tag wajib diisi | - |
| id (URL param) | Valid integer | ID tag tidak valid | - |
| id (URL param) | Tag exists | Tag tidak ditemukan | - |

**Business Validations**:
- Permission check: tags.delete.tenant
- Tag not already deleted: "Tag sudah dihapus"
- Note: Deleting tag doesn't delete entities using the tag

---

## 6. Validasi Module Management

### 6.1 Create Module (Global)

**Endpoint**: `POST /api/v1/modules`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| name | Required | Nama module wajib diisi | - |
| name | Min 2 characters | Nama module minimal 2 karakter | - |
| name | Max 100 characters | Nama module maksimal 100 karakter | Sesuai ERD |
| name | Alphanumeric with dash | Nama module hanya boleh huruf, angka, dan dash | Pattern: ^[a-z0-9-]+$ |
| name | Lowercase | Nama module harus lowercase | - |
| name | Unique | Nama module sudah ada | Global uniqueness |
| displayName | Required | Nama tampilan wajib diisi | - |
| displayName | Min 2 characters | Nama tampilan minimal 2 karakter | - |
| displayName | Max 255 characters | Nama tampilan maksimal 255 karakter | - |
| description | Optional | - | - |
| description | Max 1000 characters (if provided) | Deskripsi maksimal 1000 karakter | - |
| icon | Optional | - | Lucide icon name |
| icon | Max 50 characters (if provided) | Nama icon maksimal 50 karakter | - |
| routePrefix | Required | Route prefix wajib diisi | - |
| routePrefix | Max 100 characters | Route prefix maksimal 100 karakter | - |
| routePrefix | Valid route format | Format route tidak valid | Pattern: ^\/[a-z0-9\-\/]*$ |
| routePrefix | Unique | Route prefix sudah digunakan | - |
| isCore | Optional | - | Default: false |
| isCore | Boolean (if provided) | isCore harus berupa true atau false | - |
| order | Optional | - | Default: 0 |
| order | Integer (if provided) | Order harus berupa angka | - |
| version | Required | Versi module wajib diisi | - |
| version | Valid semver format | Format versi tidak valid | Pattern: ^\d+\.\d+\.\d+$ |

**Business Validations**:
- Permission check: modules.create.all (Super Admin only)
- Auto-generated via CLI when creating module

**Regex Patterns**:
```javascript
name: /^[a-z0-9-]+$/
routePrefix: /^\/[a-z0-9\-\/]*$/
version: /^\d+\.\d+\.\d+$/
```

---

### 6.2 Enable Module for Tenant

**Endpoint**: `POST /api/v1/tenant-modules/:moduleId/enable`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| moduleId (URL param) | Required | ID module wajib diisi | - |
| moduleId (URL param) | Valid integer | ID module tidak valid | - |
| moduleId (URL param) | Module exists | Module tidak ditemukan | - |
| config | Optional | - | JSONB field |
| config | Valid JSON (if provided) | Format konfigurasi tidak valid | - |

**Business Validations**:
- Permission check: modules.update.tenant (Tenant Admin)
- Module is active globally: "Module tidak tersedia"
- Module not already enabled: "Module sudah diaktifkan"
- Subscription tier allows module: "Module ini tidak tersedia untuk subscription tier Anda"
- Core modules auto-enabled (cannot be disabled)

---

### 6.3 Disable Module for Tenant

**Endpoint**: `POST /api/v1/tenant-modules/:moduleId/disable`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| moduleId (URL param) | Required | ID module wajib diisi | - |
| moduleId (URL param) | Valid integer | ID module tidak valid | - |
| moduleId (URL param) | Module exists | Module tidak ditemukan | - |

**Business Validations**:
- Permission check: modules.update.tenant
- Module currently enabled: "Module tidak dalam status aktif"
- Not core module: "Module inti tidak dapat dinonaktifkan"

---

### 6.4 Update Module Configuration

**Endpoint**: `PATCH /api/v1/tenant-modules/:moduleId/config`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| moduleId (URL param) | Required | ID module wajib diisi | - |
| moduleId (URL param) | Valid integer | ID module tidak valid | - |
| config | Required | Konfigurasi wajib diisi | - |
| config | Valid JSON | Format konfigurasi tidak valid | - |

**Business Validations**:
- Permission check: modules.update.tenant
- Module enabled for tenant: "Module tidak aktif untuk tenant ini"

---

## 7. Validasi File Upload

### 7.1 Upload File

**Endpoint**: `POST /api/v1/files/upload`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| file | Required | File wajib dipilih | - |
| file | File object | Format file tidak valid | multipart/form-data |
| file | Max size 5MB (default) | Ukuran file maksimal 5MB | Configurable per tenant |
| file | Max size 10MB (pro tier) | Ukuran file maksimal 10MB | Based on subscription |
| file | Max size 20MB (enterprise) | Ukuran file maksimal 20MB | Based on subscription |
| file | Valid file type | Tipe file tidak diperbolehkan | Check extension and MIME |
| file | Not empty | File tidak boleh kosong | Min size 1 byte |
| filename | Auto-sanitized | - | Remove special characters |
| filename | Max 255 characters | Nama file terlalu panjang | After sanitization |

**Allowed File Types**:

| Category | Extensions | MIME Types | Max Size |
|----------|------------|------------|----------|
| Images | jpg, jpeg, png, gif, webp | image/jpeg, image/png, image/gif, image/webp | 5MB |
| Documents | pdf, doc, docx, xls, xlsx, ppt, pptx | application/pdf, application/msword, application/vnd.openxmlformats-officedocument.* | 10MB |
| Archives | zip, rar, 7z | application/zip, application/x-rar-compressed, application/x-7z-compressed | 20MB |
| Text | txt, csv | text/plain, text/csv | 2MB |

**Business Validations**:
- Permission check: files.upload.tenant
- Tenant storage limit not exceeded: "Kapasitas penyimpanan tenant sudah penuh"
- File extension matches MIME type: "Tipe file tidak sesuai"
- Filename sanitization: Remove special chars, spaces to dash

**Security Validations**:
- Scan for malware (Phase 2): "File terdeteksi mengandung malware"
- No executable files: "File executable tidak diperbolehkan"
- No script files: "File script tidak diperbolehkan"

**Rejected Extensions** (always blocked):
```
exe, bat, cmd, sh, php, asp, aspx, jsp, js, vbs, dll, sys
```

---

### 7.2 Upload Avatar

**Endpoint**: `POST /api/v1/users/avatar`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| file | Required | File avatar wajib dipilih | - |
| file | Image only | File harus berupa gambar | jpg, jpeg, png, gif, webp |
| file | Max size 2MB | Ukuran avatar maksimal 2MB | - |
| file | Min dimension 100x100 | Dimensi avatar minimal 100x100 pixel | - |
| file | Max dimension 2000x2000 | Dimensi avatar maksimal 2000x2000 pixel | - |
| file | Aspect ratio square recommended | - | Warning, not error |

**Business Validations**:
- Permission check: users.update.own
- Auto-resize to 500x500 if larger
- Old avatar deleted (soft delete) when uploading new one

---

### 7.3 Delete File

**Endpoint**: `DELETE /api/v1/files/:id`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| id (URL param) | Required | ID file wajib diisi | - |
| id (URL param) | Valid integer | ID file tidak valid | - |
| id (URL param) | File exists | File tidak ditemukan | - |

**Business Validations**:
- Permission check: files.delete.tenant or files.delete.own
- File belongs to tenant: "File tidak ditemukan"
- File not in use: Warning message if file used in content (optional soft validation)

---

## 8. Validasi Audit Log

### 8.1 List Audit Logs

**Endpoint**: `GET /api/v1/audit-logs`

**Query Parameters Validation**:

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| page | Optional | - | Default: 1 |
| page | Integer (if provided) | Page harus berupa angka | - |
| page | Min 1 | Page minimal 1 | - |
| perPage | Optional | - | Default: 10 |
| perPage | Integer (if provided) | PerPage harus berupa angka | - |
| perPage | Min 1 | PerPage minimal 1 | - |
| perPage | Max 100 | PerPage maksimal 100 | Prevent large queries |
| filter[userId] | Optional | - | - |
| filter[userId] | Valid integer (if provided) | ID user tidak valid | - |
| filter[action] | Optional | - | - |
| filter[action] | Valid enum (if provided) | Action tidak valid | create, update, delete, login, logout |
| filter[resource] | Optional | - | - |
| filter[resource] | Max 100 characters | Resource maksimal 100 karakter | - |
| filter[dateFrom] | Optional | - | - |
| filter[dateFrom] | Valid ISO date (if provided) | Format tanggal tidak valid | - |
| filter[dateTo] | Optional | - | - |
| filter[dateTo] | Valid ISO date (if provided) | Format tanggal tidak valid | - |
| filter[dateTo] | After dateFrom | Tanggal akhir harus setelah tanggal awal | - |
| sort | Optional | - | Default: createdAt:desc |
| sort | Valid format | Format sort tidak valid | Pattern: field:asc or field:desc |

**Business Validations**:
- Permission check: audit_logs.read.tenant or audit_logs.read.all
- Tenant Admin only see own tenant logs
- Super Admin can see all tenant logs

---

## 9. Validasi Query/Filter (General)

### 9.1 Pagination Parameters

**Applicable to all list endpoints**

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| page | Optional | - | Default: 1 |
| page | Integer | Page harus berupa angka | - |
| page | Min 1 | Page minimal 1 | - |
| page | Max 10000 | Page maksimal 10000 | Reasonable limit |
| perPage | Optional | - | Default: 10 |
| perPage | Integer | PerPage harus berupa angka | - |
| perPage | Min 1 | PerPage minimal 1 | - |
| perPage | Max 100 | PerPage maksimal 100 | Prevent performance issues |

---

### 9.2 Search Parameter

**Applicable to endpoints with search feature**

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| search | Optional | - | - |
| search | String | Format pencarian tidak valid | - |
| search | Min 1 character | Kata kunci minimal 1 karakter | - |
| search | Max 255 characters | Kata kunci maksimal 255 karakter | - |
| search | Sanitized | - | Remove special SQL/XSS characters |

**Search Behavior**:
- Case-insensitive
- Partial match (LIKE %keyword%)
- Search across multiple fields (name, email, etc.)
- Trim whitespace

---

### 9.3 Filter Parameters

**Format**: `filter[fieldName]=value`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| filter[*] | Optional | - | Field-specific |
| filter[*] | Valid field name | Field filter tidak valid | Must be filterable field |
| filter[*] | Valid data type | Format filter tidak valid | Based on field type |
| filter[*] | Max 255 characters | Nilai filter terlalu panjang | - |
| filter[isActive] | Boolean | isActive harus berupa true atau false | - |
| filter[status] | Valid enum | Status tidak valid | Based on field enum |
| filter[dateFrom] | Valid ISO date | Format tanggal tidak valid | - |
| filter[dateTo] | Valid ISO date | Format tanggal tidak valid | - |

**Filterable Field Types**:
- Boolean: `true`, `false`, `1`, `0`
- Enum: Predefined values only
- Date: ISO 8601 format
- Integer: Numeric only
- String: Exact or partial match

---

### 9.4 Sort Parameters

**Format**: `sort=field:direction` or `sort=field1:asc,field2:desc`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| sort | Optional | - | Default varies by endpoint |
| sort | Valid format | Format sort tidak valid | Pattern: field:asc or field:desc |
| sort | Valid field name | Field sort tidak valid | Must be sortable field |
| sort | Valid direction | Direction harus asc atau desc | asc or desc only |
| sort | Max 5 fields | Maksimal 5 field untuk sort | Prevent complex queries |

**Common Sortable Fields**:
- name, email, createdAt, updatedAt, order

---

### 9.5 Include Parameters

**Format**: `include=relation1,relation2`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| include | Optional | - | - |
| include | Valid relation names | Relation tidak valid | Comma-separated |
| include | Max 10 relations | Maksimal 10 relations | Prevent N+1 problem |
| include | Valid relation for resource | Relation tidak tersedia | Resource-specific |

**Common Relations**:
- users: roles, tenant
- roles: permissions
- tenants: -

---

## 10. Validasi Settings

### 10.1 Update System Settings

**Endpoint**: `PUT /api/v1/settings/system`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| key | Required | Key setting wajib diisi | - |
| key | Valid key name | Key setting tidak valid | Must exist in system settings |
| value | Required | Value wajib diisi | - |
| value | Valid type | Format value tidak valid | Based on setting type |
| value | Valid format | Format value tidak sesuai | Based on setting constraints |

**Example Settings Validation**:

| Key | Type | Validation | Error Message |
|-----|------|------------|---------------|
| site_name | string | Min 2, Max 255 chars | Nama situs harus 2-255 karakter |
| maintenance_mode | boolean | true or false | Mode maintenance harus true atau false |
| default_language | string | Enum: id, en | Bahasa tidak valid |
| session_timeout | integer | Min 5, Max 1440 (minutes) | Timeout harus antara 5-1440 menit |
| max_login_attempts | integer | Min 3, Max 10 | Maksimal percobaan harus 3-10 |

**Business Validations**:
- Permission check: settings.update.all (Super Admin only)
- Setting key must exist
- Type conversion based on setting type

---

### 10.2 Update Tenant Settings

**Endpoint**: `PUT /api/v1/settings/tenant`

| Field | Rule | Pesan Error | Catatan |
|-------|------|-------------|---------|
| config | Required | Konfigurasi wajib diisi | JSONB field |
| config | Valid JSON | Format konfigurasi tidak valid | - |
| config | Valid schema | Struktur konfigurasi tidak valid | Based on config schema |

**Config Schema Validation**:
```json
{
  "branding": {
    "logo": "URL (optional, max 500 chars)",
    "primaryColor": "Hex color (optional)",
    "secondaryColor": "Hex color (optional)"
  },
  "features": {
    "maxUsers": "Integer (optional, min 1)",
    "maxStorage": "Integer (optional, min 1, in bytes)"
  },
  "limits": {
    "apiRateLimit": "Integer (optional, min 100, max 10000)",
    "storageLimit": "Integer (optional, min 1, in bytes)"
  }
}
```

**Business Validations**:
- Permission check: settings.update.tenant (Tenant Admin)
- Validate URLs if provided
- Validate colors in hex format
- Validate limits don't exceed subscription tier

---

## 11. Pesan Error Standar

### 11.1 Format Error Response

**Standard Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error utama dalam Bahasa Indonesia",
    "errors": [
      {
        "field": "namaField",
        "message": "Pesan error spesifik untuk field ini"
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 11.2 Error Codes dan Messages

**Validation Errors (400)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| VALIDATION_ERROR | Validasi gagal | General validation error |
| REQUIRED_FIELD | {field} wajib diisi | Required field missing |
| INVALID_FORMAT | Format {field} tidak valid | Format validation failed |
| INVALID_TYPE | Tipe data {field} tidak valid | Type validation failed |
| MIN_LENGTH | {field} minimal {min} karakter | Minimum length not met |
| MAX_LENGTH | {field} maksimal {max} karakter | Maximum length exceeded |
| MIN_VALUE | {field} minimal {min} | Minimum value not met |
| MAX_VALUE | {field} maksimal {max} | Maximum value exceeded |
| INVALID_EMAIL | Format email tidak valid | Email format invalid |
| INVALID_PHONE | Format nomor telepon tidak valid | Phone format invalid |
| INVALID_URL | Format URL tidak valid | URL format invalid |
| INVALID_DATE | Format tanggal tidak valid | Date format invalid |
| INVALID_ENUM | Nilai {field} tidak valid | Enum value invalid |
| DUPLICATE_VALUE | {field} sudah ada | Unique constraint violation |

**Authentication Errors (401)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| AUTHENTICATION_REQUIRED | Autentikasi diperlukan | No token provided |
| INVALID_TOKEN | Token tidak valid | Invalid or expired token |
| TOKEN_EXPIRED | Token sudah expired | Token expired |
| INVALID_CREDENTIALS | Email atau password salah | Login failed |
| SESSION_EXPIRED | Sesi Anda sudah berakhir. Silakan login kembali | Session expired |

**Authorization Errors (403)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| PERMISSION_DENIED | Anda tidak memiliki akses untuk melakukan operasi ini | No permission |
| MODULE_DISABLED | Module ini tidak tersedia untuk tenant Anda | Module not enabled |
| TENANT_INACTIVE | Tenant tidak aktif | Tenant is inactive |
| USER_INACTIVE | Akun Anda tidak aktif. Hubungi administrator | User is inactive |
| SUBSCRIPTION_EXPIRED | Subscription Anda sudah berakhir | Subscription expired |
| FEATURE_NOT_AVAILABLE | Fitur ini tidak tersedia untuk subscription tier Anda | Feature not in plan |

**Not Found Errors (404)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| RESOURCE_NOT_FOUND | {resource} tidak ditemukan | Resource not found |
| USER_NOT_FOUND | User tidak ditemukan | User not found |
| ROLE_NOT_FOUND | Role tidak ditemukan | Role not found |
| TENANT_NOT_FOUND | Tenant tidak ditemukan | Tenant not found |
| FILE_NOT_FOUND | File tidak ditemukan | File not found |

**Conflict Errors (409)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| DUPLICATE_RESOURCE | {resource} sudah ada | Resource already exists |
| CONFLICT_STATE | Konflik data. Data telah diubah oleh pengguna lain | Concurrent modification |
| ALREADY_EXISTS | {resource} dengan {field} ini sudah ada | Duplicate field value |
| CIRCULAR_REFERENCE | Referensi circular tidak diperbolehkan | Circular relationship |

**Business Logic Errors (422)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| BUSINESS_RULE_VIOLATION | Aturan bisnis tidak terpenuhi | Business rule violated |
| CANNOT_DELETE_SYSTEM_ROLE | Role sistem tidak dapat dihapus | System role deletion |
| CANNOT_DELETE_SELF | Anda tidak dapat menghapus akun sendiri | Self-deletion attempt |
| ROLE_IN_USE | Role tidak dapat dihapus karena masih ada user yang menggunakan role ini | Role has users |
| CATEGORY_HAS_CHILDREN | Kategori tidak dapat dihapus karena masih memiliki sub-kategori | Category has children |
| INSUFFICIENT_STORAGE | Kapasitas penyimpanan tidak mencukupi | Storage limit reached |
| LIMIT_EXCEEDED | Batas {limit} telah tercapai | Limit reached |

**Rate Limiting Errors (429)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| RATE_LIMIT_EXCEEDED | Terlalu banyak permintaan. Coba lagi dalam {seconds} detik | Rate limit hit |
| TOO_MANY_LOGIN_ATTEMPTS | Terlalu banyak percobaan login. Coba lagi dalam 15 menit | Login rate limit |

**Server Errors (500)**:

| Code | Message | Kapan Digunakan |
|------|---------|-----------------|
| INTERNAL_ERROR | Terjadi kesalahan sistem. Tim kami sedang menangani masalah ini | General server error |
| DATABASE_ERROR | Terjadi kesalahan database | Database error |
| SERVICE_UNAVAILABLE | Layanan sedang tidak tersedia | Service down |

---

### 11.3 Field-Specific Error Messages Template

**Template Pattern**:
```
{Field} {requirement} {constraint}
```

**Examples**:
- Email wajib diisi
- Password minimal 8 karakter
- Nama maksimal 255 karakter
- File maksimal 5MB
- Format email tidak valid
- Email sudah terdaftar

**Best Practices**:
1. ✅ Gunakan Bahasa Indonesia
2. ✅ Jelas dan actionable (user tahu harus apa)
3. ✅ Per-field (tidak bundled)
4. ✅ Spesifik (mention constraint value)
5. ❌ Jangan technical (avoid: "VARCHAR constraint violated")
6. ❌ Jangan generic ("Invalid input")
7. ❌ Jangan reveal security info ("User not found" → "Email atau password salah")

---

## 12. Validation Implementation Notes

### 12.1 Frontend Validation (React Hook Form + Zod)

**Example Zod Schema**:
```typescript
import { z } from 'zod';

const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(255, 'Password maksimal 255 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password harus mengandung huruf besar, huruf kecil, dan angka'),
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(255, 'Nama maksimal 255 karakter')
    .regex(/^[a-zA-Z\s']+$/, 'Nama hanya boleh huruf, spasi, dan tanda petik'),
  phone: z
    .string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 
      'Format nomor telepon tidak valid')
    .optional()
});
```

---

### 12.2 Backend Validation (NestJS + Zod)

**Example DTO with Zod**:
```typescript
import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  email: z.string().email().max(255).transform(val => val.toLowerCase()),
  password: z.string().min(8).max(255).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  name: z.string().min(2).max(255).regex(/^[a-zA-Z\s']+$/),
  phone: z.string().max(20).regex(/^[\+]?[(]?[0-9]{1,4}/).optional(),
  roleIds: z.array(z.number().int().positive()).min(1)
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
```

**Validation Pipe**:
```typescript
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validasi gagal',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }
      });
    }
  }
}
```

---

### 12.3 Custom Validators

**Unique Email Validator**:
```typescript
async validateUniqueEmail(email: string, tenantId: number) {
  const exists = await this.userRepo.findByEmail(email, tenantId);
  if (exists) {
    throw new ConflictException({
      success: false,
      error: {
        code: 'DUPLICATE_VALUE',
        message: 'Email sudah terdaftar',
        errors: [{ field: 'email', message: 'Email sudah terdaftar' }]
      }
    });
  }
}
```

**Role Exists Validator**:
```typescript
async validateRolesExist(roleIds: number[], tenantId: number) {
  const roles = await this.roleRepo.findByIds(roleIds, tenantId);
  if (roles.length !== roleIds.length) {
    throw new NotFoundException({
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Role tidak ditemukan',
        errors: [{ field: 'roleIds', message: 'Beberapa role tidak valid' }]
      }
    });
  }
}
```

---

## 13. Summary Validation Rules

### 13.1 Validation Checklist

**Pre-Development**:
- [ ] Review ERD untuk data types dan constraints
- [ ] Review API Contract untuk endpoint specifications
- [ ] Review Business Rules untuk business logic validations
- [ ] Identifikasi required vs optional fields
- [ ] Identifikasi unique constraints
- [ ] Identifikasi foreign key constraints

**Implementation**:
- [ ] Create Zod schemas untuk frontend dan backend
- [ ] Implement custom validators untuk business rules
- [ ] Implement error messages dalam Bahasa Indonesia
- [ ] Test validation dengan valid dan invalid inputs
- [ ] Test edge cases (empty, null, undefined, special chars)
- [ ] Test security (SQL injection, XSS, etc.)

**Testing**:
- [ ] Unit tests untuk validators
- [ ] Integration tests untuk endpoint validations
- [ ] E2E tests untuk form submissions
- [ ] Performance tests untuk large payloads
- [ ] Security tests untuk malicious inputs

---

### 13.2 Common Validation Patterns

| Pattern | Rule | Example |
|---------|------|---------|
| Email | RFC 5322 + max 255 | user@example.com |
| Password | Min 8, uppercase, lowercase, digit | SecurePass123 |
| Phone | E.164 format + max 20 | +6281234567890 |
| Name | Letters, spaces, apostrophe | John O'Brien |
| Slug | Lowercase, alphanumeric, dash | my-category-name |
| URL | Valid URL format + max 500 | https://example.com/path |
| Hex Color | # + 6 hex digits | #3B82F6 |
| Date | ISO 8601 | 2024-01-08T10:00:00.000Z |
| Integer | Numeric only | 123 |
| Boolean | true/false or 1/0 | true |

---

## Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Product Manager | TBD | ⏳ Pending | - |
| Technical Lead | TBD | ⏳ Pending | - |
| QA Engineer | TBD | ⏳ Pending | - |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-01-08 | Initial validation rules document | Technical Writer |

---

**Status**: ✅ Complete - Ready for Review  
**Next Steps**: Review dengan team, incorporate feedback, implement validations

---

*Dokumen ini adalah Validation Rules lengkap untuk Platform CMS. Untuk business logic, lihat BUSINESS-RULES.md. Untuk API detail, lihat API-CONTRACT.md.*
