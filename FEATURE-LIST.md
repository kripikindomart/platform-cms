# FEATURE LIST
# Platform CMS - Core Framework

**Document Version**: 1.0
**Last Updated**: 2024-01-08
**Status**: Feature List untuk MVP
**Reference**: PROJECT-BRIEF.md, BRD.md, PRD.md

---

## Pendahuluan

Dokumen ini berisi daftar lengkap modul dan fitur yang akan dikembangkan dalam Platform CMS MVP (Phase 1 - 16 minggu). Setiap fitur dirancang agar dapat diturunkan menjadi task coding yang actionable untuk developer dan AI models.

### Struktur Dokumen

- **Modul**: Pengelompokan fitur berdasarkan domain
- **Fitur**: Functionality spesifik dalam modul
- **Deskripsi**: Penjelasan singkat fitur
- **Prioritas**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Status MVP**: ✅ (Included), ⏳ (Phase 2), ❌ (Out of scope)

### Prioritas Definition

- **P0 (CRITICAL)**: Must have, blocking untuk MVP
- **P1 (HIGH)**: Should have, penting untuk MVP
- **P2 (MEDIUM)**: Could have, Phase 2
- **P3 (LOW)**: Would not have, Phase 3 atau never

---

## Ringkasan Modul

| No | Modul | Jumlah Fitur | Prioritas Tertinggi | Status MVP |
|----|-------|--------------|---------------------|------------|
| 1 | Authentication | 8 | P0 | ✅ MVP |
| 2 | User Management | 9 | P0 | ✅ MVP |
| 3 | Role dan Permission | 7 | P0 | ✅ MVP |
| 4 | Multi-Tenancy | 8 | P0 | ✅ MVP |
| 5 | Master Data | 4 | P1 | ✅ MVP |
| 6 | Security Layer | 8 | P0 | ✅ MVP |
| 7 | Audit Log | 5 | P0 | ✅ MVP |
| 8 | Dashboard | 6 | P1 | ✅ MVP |
| 9 | Notification | 5 | P2 | ⏳ Phase 2 |
| 10 | Report | 4 | P2 | ⏳ Phase 2 |
| 11 | Settings | 7 | P1 | ✅ MVP |
| 12 | CLI Builder | 7 | P1 | ✅ MVP |
| 13 | API Layer | 6 | P0 | ✅ MVP |
| 14 | Frontend Foundation | 9 | P0 | ✅ MVP |
| 15 | Module Management | 6 | P1 | ✅ MVP |

**Total Fitur**: 99 fitur  
**MVP (Phase 1)**: 79 fitur  
**Phase 2+**: 20 fitur

---

## 1. Modul Authentication

**Deskripsi Modul**: Mengelola autentikasi user, registrasi, login, logout, dan password management.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 1.1 | User Registration | Form registrasi dengan email, password, full_name. Validasi email unique, password strength. Hash password dengan bcrypt. | P0 | ✅ MVP |
| 1.2 | Email Verification | Generate verification token saat register. Kirim email verifikasi (Phase 1: log only, Phase 2: actual email). Verify token untuk aktivasi account. | P1 | ✅ MVP |
| 1.3 | User Login | Form login dengan email dan password. Generate JWT token. Simpan token di HTTP-only cookie. Create session di Redis. Rate limiting 5 attempts per 15 menit. | P0 | ✅ MVP |
| 1.4 | User Logout | Invalidate JWT token. Hapus session dari Redis. Clear cookie. Redirect ke login page. | P0 | ✅ MVP |
| 1.5 | Password Reset Request | Form request reset dengan email. Generate reset token (valid 1 jam). Simpan reset token di database. Kirim email dengan reset link (Phase 1: log only). | P1 | ✅ MVP |
| 1.6 | Password Reset Confirm | Validate reset token. Form set new password. Validasi password strength. Hash dan update password. Invalidate reset token. Invalidate semua sessions. | P1 | ✅ MVP |
| 1.7 | Change Password | Form change password (old password, new password, confirm password). Validate old password. Validasi new password strength. Hash dan update password. Log activity di audit log. | P1 | ✅ MVP |
| 1.8 | Session Management | Store session di Redis dengan expiration. Refresh token mechanism. Auto logout setelah inactivity (30 menit default). Multi-device session tracking. | P0 | ✅ MVP |

---

## 2. Modul User Management

**Deskripsi Modul**: Mengelola CRUD users, profile management, dan user activation/deactivation.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 2.1 | List Users | Tampilkan daftar users dengan pagination. Filter by name, email, role, status (active/inactive). Sort by name, email, created_at. Search by name atau email. Hanya tampilkan users dalam tenant yang sama (tenant isolation). | P0 | ✅ MVP |
| 2.2 | Create User | Form create user (email, full_name, phone, password). Assign default role saat create. Generate password otomatis (optional). Kirim welcome email (Phase 1: log only). Audit log creation. | P0 | ✅ MVP |
| 2.3 | View User Detail | Tampilkan detail user (profile, roles, permissions, activity). Tampilkan assigned roles. Tampilkan last login time. Tampilkan created/updated info. | P0 | ✅ MVP |
| 2.4 | Update User | Form update user (full_name, phone, avatar). Update user data. Tidak bisa update email (immutable). Audit log update. | P0 | ✅ MVP |
| 2.5 | Delete User (Soft Delete) | Soft delete user (set deleted_at, deleted_by). User tidak muncul di list. User tidak bisa login. Invalidate semua sessions. Audit log deletion. | P0 | ✅ MVP |
| 2.6 | Restore User | Tampilkan list deleted users. Restore user (set deleted_at = NULL). User kembali aktif. Audit log restoration. | P1 | ✅ MVP |
| 2.7 | Activate/Deactivate User | Toggle user status (is_active). User inactive tidak bisa login. Invalidate sessions saat deactivate. Audit log status change. | P0 | ✅ MVP |
| 2.8 | View Own Profile | User bisa view profile sendiri. Tampilkan roles dan permissions. Tampilkan activity history. | P0 | ✅ MVP |
| 2.9 | Update Own Profile | User bisa update profile sendiri (full_name, phone, avatar). User bisa change password sendiri. User tidak bisa update role sendiri. Audit log update. | P0 | ✅ MVP |

---

## 3. Modul Role dan Permission

**Deskripsi Modul**: Mengelola roles, permissions, dan RBAC (Role-Based Access Control) dengan CASL.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 3.1 | List Roles | Tampilkan daftar roles dengan pagination. Filter by name, status (active/inactive). Sort by name, created_at. Tampilkan jumlah users per role. Tenant Admin hanya lihat roles dalam tenant sendiri, Super Admin lihat semua. | P0 | ✅ MVP |
| 3.2 | Create Role | Form create role (name, description). System roles (Super Admin, Tenant Admin, User, Guest) tidak bisa dihapus. Custom roles bisa dibuat per tenant. Audit log creation. | P0 | ✅ MVP |
| 3.3 | Update Role | Form update role (name, description). System roles hanya bisa update description. Custom roles bisa update name dan description. Audit log update. | P0 | ✅ MVP |
| 3.4 | Delete Role (Soft Delete) | Soft delete custom role. Validasi: tidak ada users dengan role ini. System roles tidak bisa dihapus. Audit log deletion. | P0 | ✅ MVP |
| 3.5 | Assign Permissions to Role | Tampilkan list permissions (resource, action, scope). Assign multiple permissions ke role. Remove permissions dari role. Changes langsung berlaku untuk semua users dengan role ini. Audit log permission assignment. | P0 | ✅ MVP |
| 3.6 | Assign Roles to User | Tampilkan available roles. Assign multiple roles ke user. Remove roles dari user. Validasi: minimal 1 role per user. Changes langsung berlaku. Audit log role assignment. | P0 | ✅ MVP |
| 3.7 | Permission Check (CASL) | Middleware check permission sebelum execute action. Support scopes: own (data sendiri), tenant (data dalam tenant), all (semua data). Detailed error message jika tidak punya permission. Integration dengan CASL library. | P0 | ✅ MVP |

---

## 4. Modul Multi-Tenancy

**Deskripsi Modul**: Mengelola tenants, schema isolation, dan tenant configuration.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 4.1 | List Tenants | Tampilkan daftar tenants dengan pagination (Super Admin only). Filter by name, status (active/inactive). Sort by name, created_at. Search by name atau domain. Tampilkan jumlah users per tenant. | P0 | ✅ MVP |
| 4.2 | Create Tenant | Form create tenant (name, domain optional). Auto-generate slug dari name (lowercase, dash-separated). Create PostgreSQL schema (tenant_xxx). Setup default roles dan permissions. Create tenant admin user. Audit log creation. | P0 | ✅ MVP |
| 4.3 | View Tenant Detail | Tampilkan detail tenant (name, slug, domain, schema_name, config). Tampilkan statistics (jumlah users, storage usage). Tampilkan subscription info (tier, expires_at). Tampilkan created/updated info. | P0 | ✅ MVP |
| 4.4 | Update Tenant | Form update tenant (name, domain, config). Tidak bisa update slug atau schema_name (immutable). Update subscription info. Audit log update. | P0 | ✅ MVP |
| 4.5 | Delete Tenant (Soft Delete) | Soft delete tenant (Super Admin only). Validasi: confirm deletion (type tenant name). Soft delete semua users dalam tenant. Deactivate tenant (is_active = false). Schema tidak dihapus, hanya di-mark. Audit log deletion. | P0 | ✅ MVP |
| 4.6 | Restore Tenant | Tampilkan list deleted tenants. Restore tenant (set deleted_at = NULL). Activate tenant (is_active = true). Restore users yang di-delete bersamaan. Audit log restoration. | P1 | ✅ MVP |
| 4.7 | Tenant Context Middleware | Extract tenant dari JWT token. Set PostgreSQL search_path ke tenant schema. Semua queries otomatis ke tenant schema. Validasi tenant active. Error handling jika tenant tidak ditemukan atau inactive. | P0 | ✅ MVP |
| 4.8 | Tenant Configuration | Form tenant config (JSONB field). Custom settings per tenant (theme, features, limits). Validation config structure. API get tenant config (untuk frontend). Audit log config change. | P1 | ✅ MVP |

---

**Total Fitur**: 93 fitur  
**MVP (Phase 1)**: 73 fitur  
**Phase 2+**: 20 fitur

---

## 1. Modul Authentication

**Deskripsi Modul**: Mengelola autentikasi user, registrasi, login, logout, dan password management.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 1.1 | User Registration | Form registrasi dengan email, password, full_name. Validasi email unique, password strength. Hash password dengan bcrypt. | P0 | ✅ MVP |
| 1.2 | Email Verification | Generate verification token saat register. Kirim email verifikasi (Phase 1: log only, Phase 2: actual email). Verify token untuk aktivasi account. | P1 | ✅ MVP |
| 1.3 | User Login | Form login dengan email dan password. Generate JWT token. Simpan token di HTTP-only cookie. Create session di Redis. Rate limiting 5 attempts per 15 menit. | P0 | ✅ MVP |
| 1.4 | User Logout | Invalidate JWT token. Hapus session dari Redis. Clear cookie. Redirect ke login page. | P0 | ✅ MVP |
| 1.5 | Password Reset Request | Form request reset dengan email. Generate reset token (valid 1 jam). Simpan reset token di database. Kirim email dengan reset link (Phase 1: log only). | P1 | ✅ MVP |
| 1.6 | Password Reset Confirm | Validate reset token. Form set new password. Validasi password strength. Hash dan update password. Invalidate reset token. Invalidate semua sessions. | P1 | ✅ MVP |
| 1.7 | Change Password | Form change password (old password, new password, confirm password). Validate old password. Validasi new password strength. Hash dan update password. Log activity di audit log. | P1 | ✅ MVP |
| 1.8 | Session Management | Store session di Redis dengan expiration. Refresh token mechanism. Auto logout setelah inactivity (30 menit default). Multi-device session tracking. | P0 | ✅ MVP |

---

## 2. Modul User Management

**Deskripsi Modul**: Mengelola CRUD users, profile management, dan user activation/deactivation.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 2.1 | List Users | Tampilkan daftar users dengan pagination. Filter by name, email, role, status (active/inactive). Sort by name, email, created_at. Search by name atau email. Hanya tampilkan users dalam tenant yang sama (tenant isolation). | P0 | ✅ MVP |
| 2.2 | Create User | Form create user (email, full_name, phone, password). Assign default role saat create. Generate password otomatis (optional). Kirim welcome email (Phase 1: log only). Audit log creation. | P0 | ✅ MVP |
| 2.3 | View User Detail | Tampilkan detail user (profile, roles, permissions, activity). Tampilkan assigned roles. Tampilkan last login time. Tampilkan created/updated info. | P0 | ✅ MVP |
| 2.4 | Update User | Form update user (full_name, phone, avatar). Update user data. Tidak bisa update email (immutable). Audit log update. | P0 | ✅ MVP |
| 2.5 | Delete User (Soft Delete) | Soft delete user (set deleted_at, deleted_by). User tidak muncul di list. User tidak bisa login. Invalidate semua sessions. Audit log deletion. | P0 | ✅ MVP |
| 2.6 | Restore User | Tampilkan list deleted users. Restore user (set deleted_at = NULL). User kembali aktif. Audit log restoration. | P1 | ✅ MVP |
| 2.7 | Activate/Deactivate User | Toggle user status (is_active). User inactive tidak bisa login. Invalidate sessions saat deactivate. Audit log status change. | P0 | ✅ MVP |
| 2.8 | View Own Profile | User bisa view profile sendiri. Tampilkan roles dan permissions. Tampilkan activity history. | P0 | ✅ MVP |
| 2.9 | Update Own Profile | User bisa update profile sendiri (full_name, phone, avatar). User bisa change password sendiri. User tidak bisa update role sendiri. Audit log update. | P0 | ✅ MVP |

---

## 3. Modul Role dan Permission

**Deskripsi Modul**: Mengelola roles, permissions, dan RBAC (Role-Based Access Control) dengan CASL.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 3.1 | List Roles | Tampilkan daftar roles dengan pagination. Filter by name, status (active/inactive). Sort by name, created_at. Tampilkan jumlah users per role. Tenant Admin hanya lihat roles dalam tenant sendiri, Super Admin lihat semua. | P0 | ✅ MVP |
| 3.2 | Create Role | Form create role (name, description). System roles (Super Admin, Tenant Admin, User, Guest) tidak bisa dihapus. Custom roles bisa dibuat per tenant. Audit log creation. | P0 | ✅ MVP |
| 3.3 | Update Role | Form update role (name, description). System roles hanya bisa update description. Custom roles bisa update name dan description. Audit log update. | P0 | ✅ MVP |
| 3.4 | Delete Role (Soft Delete) | Soft delete custom role. Validasi: tidak ada users dengan role ini. System roles tidak bisa dihapus. Audit log deletion. | P0 | ✅ MVP |
| 3.5 | Assign Permissions to Role | Tampilkan list permissions (resource, action, scope). Assign multiple permissions ke role. Remove permissions dari role. Changes langsung berlaku untuk semua users dengan role ini. Audit log permission assignment. | P0 | ✅ MVP |
| 3.6 | Assign Roles to User | Tampilkan available roles. Assign multiple roles ke user. Remove roles dari user. Validasi: minimal 1 role per user. Changes langsung berlaku. Audit log role assignment. | P0 | ✅ MVP |
| 3.7 | Permission Check (CASL) | Middleware check permission sebelum execute action. Support scopes: own (data sendiri), tenant (data dalam tenant), all (semua data). Detailed error message jika tidak punya permission. Integration dengan CASL library. | P0 | ✅ MVP |

---

## 4. Modul Multi-Tenancy

**Deskripsi Modul**: Mengelola tenants, schema isolation, dan tenant configuration.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 4.1 | List Tenants | Tampilkan daftar tenants dengan pagination (Super Admin only). Filter by name, status (active/inactive). Sort by name, created_at. Search by name atau domain. Tampilkan jumlah users per tenant. | P0 | ✅ MVP |
| 4.2 | Create Tenant | Form create tenant (name, domain optional). Auto-generate slug dari name (lowercase, dash-separated). Create PostgreSQL schema (tenant_xxx). Setup default roles dan permissions. Create tenant admin user. Audit log creation. | P0 | ✅ MVP |
| 4.3 | View Tenant Detail | Tampilkan detail tenant (name, slug, domain, schema_name, config). Tampilkan statistics (jumlah users, storage usage). Tampilkan subscription info (tier, expires_at). Tampilkan created/updated info. | P0 | ✅ MVP |
| 4.4 | Update Tenant | Form update tenant (name, domain, config). Tidak bisa update slug atau schema_name (immutable). Update subscription info. Audit log update. | P0 | ✅ MVP |
| 4.5 | Delete Tenant (Soft Delete) | Soft delete tenant (Super Admin only). Validasi: confirm deletion (type tenant name). Soft delete semua users dalam tenant. Deactivate tenant (is_active = false). Schema tidak dihapus, hanya di-mark. Audit log deletion. | P0 | ✅ MVP |
| 4.6 | Restore Tenant | Tampilkan list deleted tenants. Restore tenant (set deleted_at = NULL). Activate tenant (is_active = true). Restore users yang di-delete bersamaan. Audit log restoration. | P1 | ✅ MVP |
| 4.7 | Tenant Context Middleware | Extract tenant dari JWT token. Set PostgreSQL search_path ke tenant schema. Semua queries otomatis ke tenant schema. Validasi tenant active. Error handling jika tenant tidak ditemukan atau inactive. | P0 | ✅ MVP |
| 4.8 | Tenant Configuration | Form tenant config (JSONB field). Custom settings per tenant (theme, features, limits). Validation config structure. API get tenant config (untuk frontend). Audit log config change. | P1 | ✅ MVP |

---

## 5. Modul Master Data

**Deskripsi Modul**: Mengelola data master yang digunakan sebagai referensi di seluruh aplikasi.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 5.1 | Manage Categories | CRUD categories (name, slug, description, parent_id untuk hierarchy). Soft delete. Tree structure support. Used as reference untuk other modules. | P1 | ✅ MVP |
| 5.2 | Manage Tags | CRUD tags (name, slug, color). Soft delete. Tag dapat di-attach ke multiple entities. Search dan filter by tag. | P1 | ✅ MVP |
| 5.3 | Manage Status | CRUD custom statuses (name, color, icon, order). Soft delete. Digunakan untuk workflow status. Reorder status via drag-and-drop (frontend). | P1 | ✅ MVP |
| 5.4 | Manage Metadata | CRUD metadata key-value pairs. Flexible schema (JSONB). Per-tenant metadata. Used untuk custom configurations. | P1 | ✅ MVP |

---

## 6. Modul Security Layer

**Deskripsi Modul**: Security middleware, sanitization, validation, dan rate limiting.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 6.1 | Input Sanitization | Automatic sanitization untuk semua input (XSS prevention). Strip HTML tags (except allowed tags). Escape special characters. Middleware applied ke semua endpoints. | P0 | ✅ MVP |
| 6.2 | Output Encoding | Encode output sebelum dikirim ke client. Prevent XSS via output. Applied di response middleware. | P0 | ✅ MVP |
| 6.3 | Request Validation | Validate request dengan Zod schemas. Detailed error messages per-field (Bahasa Indonesia). Validation di DTO layer. Type-safe validation. | P0 | ✅ MVP |
| 6.4 | SQL Injection Prevention | Use parameterized queries (Drizzle ORM). Never use raw SQL dengan user input. Query builder type-safe. Audit raw queries. | P0 | ✅ MVP |
| 6.5 | Rate Limiting | Per-tenant rate limiting. Per-endpoint rate limiting. Configurable limits (requests per minute). Response 429 Too Many Requests dengan retry-after header. | P0 | ✅ MVP |
| 6.6 | Security Headers | Helmet.js integration. CSP (Content Security Policy). HSTS (HTTP Strict Transport Security). X-Frame-Options, X-Content-Type-Options. | P0 | ✅ MVP |
| 6.7 | CORS Configuration | Configurable CORS per tenant. Whitelist allowed origins. Credentials support. Preflight request handling. | P0 | ✅ MVP |
| 6.8 | File Upload Validation | Validate file type (whitelist extensions). Validate file size (max limit). Scan file untuk malware (Phase 2: ClamAV). Generate safe filename. Store file metadata. | P1 | ✅ MVP |

---

## 7. Modul Audit Log

**Deskripsi Modul**: Logging semua critical operations untuk accountability dan compliance.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 7.1 | Log User Actions | Log semua CRUD operations (create, update, delete, restore). Log authentication events (login, logout, failed login). Log permission changes. Store user_id, tenant_id, action, resource, resource_id. | P0 | ✅ MVP |
| 7.2 | Log Data Changes | Store before/after values (changes JSONB field). Track what changed (field-level tracking). Timestamp setiap change. Who made the change (created_by, updated_by). | P0 | ✅ MVP |
| 7.3 | View Audit Logs | List audit logs dengan pagination. Filter by user, action, resource, date range. Sort by timestamp. Search by resource_id atau description. Tenant isolation (Tenant Admin lihat logs tenant sendiri). | P0 | ✅ MVP |
| 7.4 | Export Audit Logs | Export audit logs ke CSV (Phase 1). Export audit logs ke Excel (Phase 2). Export audit logs ke PDF (Phase 2). Filter sebelum export. | P2 | ⏳ Phase 2 |
| 7.5 | Audit Log Retention | Auto-archive old logs (>1 tahun). Configurable retention period per tenant. Compressed archive storage. Restore archived logs jika needed. | P2 | ⏳ Phase 2 |

---

## 8. Modul Dashboard

**Deskripsi Modul**: Dashboard dengan statistics, charts, dan quick actions.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 8.1 | Dashboard Overview | Widget-based dashboard. Show key metrics (total users, active tenants, dll). Customizable widgets per role. Real-time data (WebSocket di Phase 2). | P1 | ✅ MVP |
| 8.2 | User Statistics | Total users (active, inactive). New users (today, this week, this month). Users by role. Users by tenant (Super Admin only). | P1 | ✅ MVP |
| 8.3 | Tenant Statistics | Total tenants (active, inactive). New tenants (today, this week, this month). Tenants by subscription tier. Storage usage per tenant. | P1 | ✅ MVP |
| 8.4 | Activity Timeline | Recent activities (last login, created users, updates). Filter by date range. Filter by action type. Per-tenant view. | P1 | ✅ MVP |
| 8.5 | System Health | API response time average. Database query time average. Redis connection status. Memory usage, CPU usage. Error rate (last 24h). | P1 | ✅ MVP |
| 8.6 | Quick Actions | Quick create buttons (new user, new tenant, dll). Quick links ke frequently used features. Customizable per role. | P1 | ✅ MVP |

---

## 9. Modul Notification

**Deskripsi Modul**: System notifications dan user notifications (Phase 2).

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 9.1 | In-App Notifications | Bell icon dengan notification count. List notifications dengan read/unread status. Mark as read/unread. Mark all as read. Delete notification. | P2 | ⏳ Phase 2 |
| 9.2 | Email Notifications | Send email untuk important events (password reset, welcome, dll). Email templates (Handlebars). Queue email sending (Bull). Track email delivery status. | P2 | ⏳ Phase 2 |
| 9.3 | Notification Preferences | User bisa set notification preferences. Enable/disable per notification type. Email notification on/off. In-app notification on/off. | P2 | ⏳ Phase 2 |
| 9.4 | Notification Templates | Manage notification templates. Support variables (user name, tenant name, dll). Preview template. Version control templates. | P2 | ⏳ Phase 2 |
| 9.5 | Push Notifications | Browser push notifications (Phase 3). Mobile push notifications (Phase 3). Notification scheduling. | P3 | ❌ Phase 3 |

---

## 10. Modul Report

**Deskripsi Modul**: Generate reports dan export data (Phase 2).

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 10.1 | User Report | Report daftar users dengan filters. Export ke CSV, Excel, PDF. Customizable columns. Scheduled reports (email daily/weekly). | P2 | ⏳ Phase 2 |
| 10.2 | Activity Report | Report aktivitas users (login, actions, dll). Filter by date range, user, action type. Visualisasi dengan charts. Export ke PDF. | P2 | ⏳ Phase 2 |
| 10.3 | Tenant Report | Report daftar tenants dengan statistics. Storage usage per tenant. User count per tenant. Revenue per tenant (jika ada billing). | P2 | ⏳ Phase 2 |
| 10.4 | Custom Reports | Report builder dengan drag-and-drop (Phase 3). SQL query builder untuk custom reports. Save report templates. Share reports dengan users. | P3 | ❌ Phase 3 |

---

## 11. Modul Settings

**Deskripsi Modul**: Application settings dan system configuration.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 11.1 | System Settings | Configure system-wide settings (Super Admin only). Site name, logo, favicon. Default language, timezone. Maintenance mode on/off. | P1 | ✅ MVP |
| 11.2 | Tenant Settings | Configure tenant-specific settings (Tenant Admin). Tenant branding (logo, colors, theme). Feature toggles per tenant. Storage limits, user limits. | P1 | ✅ MVP |
| 11.3 | Email Settings | SMTP configuration. Email templates configuration. Test email sending. Email queue settings. | P2 | ⏳ Phase 2 |
| 11.4 | Security Settings | Password policy (min length, complexity). Session timeout duration. MFA enabled/disabled (Phase 2). IP whitelist/blacklist (Phase 2). | P1 | ✅ MVP |
| 11.5 | API Settings | API rate limiting configuration. API versioning settings. Swagger UI enabled/disabled. API key management (Phase 2). | P1 | ✅ MVP |
| 11.6 | Storage Settings | File upload size limits. Allowed file types. Storage provider configuration (local, S3, dll). Auto-cleanup old files. | P1 | ✅ MVP |
| 11.7 | Backup Settings | Backup schedule configuration. Backup retention period. Auto-backup enabled/disabled. Restore from backup. | P2 | ⏳ Phase 2 |

---

## 12. Modul CLI Builder

**Deskripsi Modul**: CLI tool untuk generate code secara otomatis.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 12.1 | Generate Module | Command: platform-cli generate:module [name]. Generate NestJS module, controller, service, repository. Generate entity dengan Drizzle schema. Generate DTOs (create, update, response). Generate basic tests. | P1 | ✅ MVP |
| 12.2 | Generate CRUD | Command: platform-cli generate:crud [name]. Generate full CRUD operations. Include soft delete functionality. Include pagination, filter, sort. Generate frontend pages (list, create, edit, view). | P1 | ✅ MVP |
| 12.3 | Generate Migration | Command: platform-cli generate:migration [name]. Generate Drizzle migration file. Migration template dengan up/down. Timestamp-based naming. Auto-detect schema changes (Phase 2). | P1 | ✅ MVP |
| 12.4 | Generate Entity | Command: platform-cli generate:entity [name]. Generate Drizzle entity/schema. Include soft delete columns. Include audit columns (created_by, updated_by, deleted_by). TypeScript types auto-generated. | P1 | ✅ MVP |
| 12.5 | Generate Tests | Command: platform-cli generate:test [module]. Generate unit tests (Vitest). Generate integration tests. Mock data generators. Test coverage report. | P1 | ✅ MVP |
| 12.6 | Generate Documentation | Command: platform-cli generate:docs [module]. Generate API documentation (Swagger). Generate README per module. Generate TSDoc comments. | P1 | ✅ MVP |
| 12.7 | CLI Templates | Customizable templates untuk generators. Template variables (module name, author, dll). Template versioning. Share templates antar projects. | P1 | ✅ MVP |

---

## 13. Modul API Layer

**Deskripsi Modul**: REST API standards, documentation, dan conventions.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 13.1 | REST API Standards | Consistent HTTP verbs (GET, POST, PUT, PATCH, DELETE). Consistent status codes (200, 201, 400, 401, 403, 404, 500). Consistent URL structure (/api/v1/resource). Consistent response format. | P0 | ✅ MVP |
| 13.2 | Response Format | Success response: {success: true, data: {}, meta: {}}. Error response: {success: false, error: {message, errors: []}}. Per-field errors dalam array. Request ID di response header. | P0 | ✅ MVP |
| 13.3 | Pagination | Cursor-based pagination (default). Offset-based pagination (optional). Meta info (total, page, perPage, totalPages). Links (next, prev, first, last). | P0 | ✅ MVP |
| 13.4 | Filtering dan Sorting | Query params untuk filter (filter[field]=value). Query params untuk sort (sort=field:asc). Multiple filters support. Multiple sort fields support. | P0 | ✅ MVP |
| 13.5 | API Versioning | URL-based versioning (/api/v1/, /api/v2/). Deprecation warnings untuk old versions. Version documentation. Migration guide antar versions. | P0 | ✅ MVP |
| 13.6 | Swagger Documentation | OpenAPI 3.0 specification. Interactive API docs (Swagger UI). Auto-generated dari decorators. Request/response examples. Authentication documentation. | P1 | ✅ MVP |

---

## 14. Modul Frontend Foundation

**Deskripsi Modul**: Frontend components, layouts, dan utilities.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 14.1 | Layout Components | Main layout (Header, Sidebar, Footer, Content). Auth layout (untuk login, register pages). Empty layout (untuk public pages). Responsive sidebar (collapsible). Breadcrumbs navigation. | P0 | ✅ MVP |
| 14.2 | Form Components | Input (text, email, password, number, tel). Select (single, multiple). Textarea. Checkbox, Radio. Date picker, Time picker. File upload dengan preview. Form validation dengan Zod. Real-time validation feedback. | P0 | ✅ MVP |
| 14.3 | Table Components | Data table dengan pagination. Sortable columns. Filterable columns. Search box. Bulk actions (select all, bulk delete). Responsive table (mobile-friendly). Export to CSV (client-side). | P0 | ✅ MVP |
| 14.4 | UI Components | Button (primary, secondary, ghost, destructive). Card, Badge, Alert. Modal, Drawer, Popover. Loading spinner, Skeleton. Toast notifications. Tabs, Accordion. | P0 | ✅ MVP |
| 14.5 | Theme System | Light mode dan Dark mode. Theme switcher (toggle). Persisted theme preference (localStorage). shadcn/ui theming. Custom color palettes per tenant (Phase 2). | P1 | ✅ MVP |
| 14.6 | State Management | Zustand untuk global state. TanStack Query untuk server state. Form state dengan React Hook Form. Auth state management. Tenant context state. | P0 | ✅ MVP |
| 14.7 | Error Handling | Error boundaries untuk catch errors. Global error handler. Error toast notifications. Retry mechanisms. Detailed error pages (404, 500, 403). | P0 | ✅ MVP |
| 14.8 | Loading States | Loading spinners untuk buttons. Skeleton loaders untuk content. Suspense boundaries. Progressive loading. Optimistic updates. | P1 | ✅ MVP |
| 14.9 | Responsive Design | Mobile-first approach. Breakpoints (sm, md, lg, xl, 2xl). Tailwind CSS responsive utilities. Touch-friendly UI (mobile). Hamburger menu (mobile). | P0 | ✅ MVP |

---

## 15. Modul Module Management

**Deskripsi Modul**: Mengelola module registry, enable/disable module per tenant, dan dynamic feature loading.

| No | Fitur | Deskripsi | Prioritas | Status MVP |
|----|-------|-----------|-----------|------------|
| 15.1 | Module Registry | Table modules di database (global). Store module metadata: name, display_name, description, icon, route_prefix, is_core, version. Auto-register saat CLI generate module. List all available modules (Super Admin). | P1 | ✅ MVP |
| 15.2 | Module Permissions Mapping | Table module_permissions untuk link permissions ke module. Setiap module punya set permissions default (create, read, update, delete). Auto-create permissions saat register module. | P1 | ✅ MVP |
| 15.3 | Tenant Module Enable/Disable | Table tenant_modules untuk track enabled modules per tenant. Tenant Admin bisa enable/disable non-core modules. Core modules (authentication, user management, role management) always enabled. Check subscription tier sebelum enable module. | P1 | ✅ MVP |
| 15.4 | Module Configuration per Tenant | JSONB config field di tenant_modules. Per-tenant module settings (custom labels, limits, features). API get module config untuk frontend. Validation config structure. | P1 | ✅ MVP |
| 15.5 | Dynamic Menu Generation | Generate sidebar menu dari enabled modules. Filter menu by user permissions. Order menu by module.order field. Icon dan route auto-loaded dari module metadata. | P1 | ✅ MVP |
| 15.6 | Module Guard Middleware | Check module enabled untuk tenant sebelum allow access. Return 403 jika module not enabled. Apply guard ke semua routes dalam module. Cache enabled modules per tenant di Redis. | P1 | ✅ MVP |

---

## Mapping Fitur ke MVP Timeline

### Week 1-2: Project Setup
- Setup repository dan CI/CD
- Initialize NestJS dan Next.js
- Configure Drizzle ORM
- Setup Redis connection

### Week 3-5: Database dan Multi-Tenancy
- **Modul 4**: Multi-Tenancy (semua fitur)
- **Modul 15**: Module Management (15.1, 15.2 - Module Registry & Permissions)
- Database migration system
- Soft delete implementation

### Week 6-8: Authentication dan Authorization
- **Modul 1**: Authentication (semua fitur)
- **Modul 2**: User Management (2.1-2.5, 2.7-2.9)
- **Modul 3**: Role dan Permission (semua fitur)

### Week 9-10: Security Layer
- **Modul 6**: Security Layer (semua fitur)
- **Modul 7**: Audit Log (7.1-7.3)
- **Modul 15**: Module Management (15.3, 15.6 - Enable/Disable & Guard)

### Week 11: Error Handling dan Logging
- **Modul 14**: Frontend Foundation (14.7 Error Handling)
- **Modul 13**: API Layer (13.2 Response Format)
- Centralized logging (Winston)

### Week 12-14: CLI Builder Tool
- **Modul 12**: CLI Builder (semua fitur)
- Template library
- Documentation generator

### Week 15: Frontend Foundation
- **Modul 14**: Frontend Foundation (14.1-14.6, 14.8-14.9)
- **Modul 8**: Dashboard (8.1-8.6)
- **Modul 15**: Module Management (15.4, 15.5 - Config & Dynamic Menu)
- shadcn/ui integration

### Week 16: Documentation dan Polish
- **Modul 13**: API Layer (13.6 Swagger)
- **Modul 11**: Settings (11.1, 11.2, 11.4-11.6)
- **Modul 5**: Master Data (opsional, jika ada waktu)
- Final testing dan bug fixes

---

## Feature Dependencies

### Critical Path (Blocking Features)

1. **Authentication System** → Blocks: All features (need auth)
2. **Multi-Tenancy Core** → Blocks: All tenant-specific features
3. **Role & Permission** → Blocks: Authorization checks
4. **Database Layer** → Blocks: All data operations
5. **API Standards** → Blocks: Frontend integration

### High Priority Dependencies

- **User Management** depends on: Authentication, Role & Permission
- **Security Layer** depends on: API Layer, Database Layer
- **Audit Log** depends on: Authentication, User Management
- **Dashboard** depends on: All data modules
- **CLI Builder** depends on: Database schema design, API patterns

---

## Out of Scope (Explicitly NOT in MVP)

### Business Logic Features
- ❌ Approval workflow (Phase 3)
- ❌ Document management (Phase 3)
- ❌ Complex reporting (Phase 2)
- ❌ Advanced analytics (Phase 3)
- ❌ Billing/Payment system (Phase 3)

### Technical Features
- ❌ GraphQL API (Phase 2)
- ❌ WebSocket real-time (Phase 2)
- ❌ Mobile app (Phase 3)
- ❌ Elasticsearch (Phase 3)
- ❌ Advanced caching layers (Phase 2)
- ❌ Background job queues (Phase 2)
- ❌ MFA/2FA (Phase 2)
- ❌ OAuth providers (Phase 2)

### Infrastructure
- ❌ Kubernetes deployment (Phase 2)
- ❌ Auto-scaling (Phase 2)
- ❌ CDN integration (Phase 2)
- ❌ Advanced monitoring (Grafana, Prometheus) (Phase 2)

---

## Summary

**Total Fitur Defined**: 99 fitur  
**MVP Fitur**: 79 fitur (80%)  
**Phase 2 Fitur**: 16 fitur (16%)  
**Phase 3/Out of Scope**: 4 fitur (4%)  

**Modul Priorities**:
- **P0 (Critical)**: 6 modul → 57 fitur
- **P1 (High)**: 5 modul → 22 fitur  
- **P2 (Medium)**: 4 modul → 20 fitur

**Development Approach**:
1. Build critical modules first (Auth, Multi-tenancy, RBAC)
2. Add security layer early
3. CLI builder untuk accelerate development
4. Frontend foundation last (reusable components)
5. Documentation throughout

---

**Status**: ✅ Complete - Ready for Task Breakdown  
**Next Document**: TASK-LIST.md atau TECHNICAL-ARCHITECTURE.md  
**Dependencies**: PRD approved ✅  

---

*Dokumen ini adalah feature list lengkap untuk Platform CMS MVP. Setiap fitur dapat diturunkan menjadi coding tasks yang specific dan measurable.*
