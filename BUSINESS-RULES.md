# BUSINESS RULES
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Business Rules Specification  
**Reference**: PROJECT-BRIEF.md, BRD.md, PRD.md, FEATURE-LIST.md, USER-FLOW.md

---

## Pendahuluan

Dokumen ini berisi aturan bisnis yang harus diikuti oleh sistem Platform CMS. Aturan bisnis fokus pada logika bisnis dan workflow, bukan validasi teknis detail atau implementasi API.

**Tujuan**: Memastikan developer memahami aturan bisnis dengan jelas sehingga tidak salah menafsirkan fitur.

**Scope**: 
- ✅ Aturan bisnis (business logic, workflow, permissions)
- ✅ Batasan operasional (siapa boleh apa, kapan, bagaimana)
- ❌ Validasi teknis detail (regex, max length, dll) → lihat API-CONTRACT.md
- ❌ API contract detail → lihat API-CONTRACT.md

---

## 1. Aturan Umum Sistem

### 1.1 Multi-Tenancy dan Isolasi Data

**BR-001: Isolasi Data Tenant WAJIB**
- Setiap request harus selalu aware tenant context
- Query database harus otomatis menggunakan schema tenant yang benar
- Tidak boleh ada akses cross-tenant kecuali Super Admin dengan explicit permission
- Tenant context diambil dari JWT token
- Jika tenant tidak aktif (is_active = false), akses ditolak

**BR-002: Super Admin adalah Pengecualian**
- Super Admin dapat melihat dan manage data dari semua tenant
- Super Admin dapat switch context ke tenant manapun
- Audit log harus mencatat setiap akses Super Admin ke tenant lain

**BR-003: Tenant Baru**
- Setiap tenant baru otomatis mendapat schema PostgreSQL tersendiri (tenant_xxx)
- Schema tenant harus berisi default roles (Tenant Admin, User)
- Tenant baru otomatis mendapat user Tenant Admin
- Tenant baru dalam status aktif (is_active = true) by default

### 1.2 Soft Delete Mandatory

**BR-004: Tidak Ada Hard Delete**
- Semua data krusial TIDAK BOLEH dihapus permanent (hard delete)
- Delete operation hanya set deleted_at timestamp dan deleted_by user ID
- Data yang di-soft delete tidak muncul di query default
- Data yang di-soft delete dapat di-restore

**BR-005: Data yang Wajib Soft Delete**
- Users
- Tenants
- Roles (kecuali system roles)
- Master data (categories, tags)
- Semua business data

**BR-006: Data yang Boleh Hard Delete**
- Sessions yang expired
- Temporary files yang sudah tidak digunakan
- Audit logs yang sudah melewati retention period (jika ada kebijakan)
- Password reset tokens yang expired

### 1.3 Audit Trail

**BR-007: Operasi yang Wajib Di-audit**
- Semua CRUD operations (create, update, delete, restore)
- Authentication events (login sukses, login gagal, logout)
- Authorization events (permission denied, role changed)
- Configuration changes (system settings, tenant settings)
- Sensitive data access (by Super Admin ke tenant lain)

**BR-008: Informasi Audit**
- Setiap audit log harus mencatat: user_id, tenant_id, action, resource, resource_id, timestamp, IP address, user agent
- Untuk update operations, simpan before/after values
- Audit log tidak bisa diedit atau dihapus oleh user biasa
- Hanya Super Admin yang dapat melihat audit log semua tenant

### 1.4 Authentication dan Session

**BR-009: Aturan Login**
- User hanya bisa login jika status aktif (is_active = true)
- User hanya bisa login jika tenant aktif (tenant.is_active = true)
- Login gagal 5 kali dalam 15 menit, account di-lock sementara (rate limiting)
- Setiap login sukses generate JWT token dan session di Redis

**BR-010: Aturan Session**
- Session default expire setelah 8 jam inactivity
- User dapat memiliki multiple sessions (multi-device)
- Logout menghapus session dari Redis dan invalidate token
- Jika user di-deactivate, semua session harus di-invalidate

**BR-011: Aturan Password**
- Password minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka
- Password di-hash dengan bcrypt sebelum disimpan
- User tidak bisa reuse password lama (simpan history)
- Password reset token hanya valid 1 jam
- Password reset token hanya bisa digunakan sekali

---

## 2. Aturan Setiap Role

### 2.1 Super Admin

**BR-012: Hak Akses Super Admin**
- Dapat manage semua tenant (create, update, delete, restore)
- Dapat melihat dan manage users di semua tenant
- Dapat manage system settings (global configuration)
- Dapat melihat audit log semua tenant
- Dapat create dan manage system roles
- Tidak terikat tenant (tenant_id bisa NULL)

**BR-013: Batasan Super Admin**
- Tidak dapat delete system roles (Super Admin, Tenant Admin, User, Guest)
- Tidak dapat modify own Super Admin role (prevent lockout)
- Tidak dapat deactivate diri sendiri
- Setiap aksi Super Admin ke tenant lain harus di-audit secara khusus

### 2.2 Tenant Admin

**BR-014: Hak Akses Tenant Admin**
- Dapat manage users dalam tenant sendiri (create, update, delete, restore)
- Dapat assign roles ke users dalam tenant
- Dapat manage custom roles dalam tenant
- Dapat manage tenant configuration (settings tenant)
- Dapat melihat audit log dalam tenant sendiri
- Dapat enable/disable modules untuk tenant sendiri

**BR-015: Batasan Tenant Admin**
- Tidak dapat akses data tenant lain
- Tidak dapat manage users di tenant lain
- Tidak dapat modify system roles (hanya custom roles)
- Tidak dapat delete system roles
- Tidak dapat manage tenant lain
- Tidak dapat change own role jika hanya punya 1 role
- Tidak dapat deactivate diri sendiri

### 2.3 User (Regular)

**BR-016: Hak Akses User**
- Dapat CRUD data sesuai permissions yang di-assign
- Dapat melihat dan update profile sendiri
- Dapat change password sendiri
- Dapat melihat activity history sendiri
- Access level tergantung scope permission (own, tenant, all)

**BR-017: Batasan User**
- Tidak dapat manage users lain (kecuali ada permission)
- Tidak dapat assign roles (kecuali ada permission)
- Tidak dapat akses data tenant lain
- Tidak dapat change own role
- Tidak dapat deactivate diri sendiri
- Hanya bisa akses modules yang enabled untuk tenant

### 2.4 Guest (Optional)

**BR-018: Hak Akses Guest**
- Hanya read-only access untuk public data
- Tidak ada write operations
- Tidak ada access ke sensitive data

**BR-019: Batasan Guest**
- Tidak dapat create, update, atau delete data apapun
- Tidak dapat melihat data internal
- Tidak dapat akses audit logs
- Tidak dapat manage profile (karena read-only)

### 2.5 Aturan Umum Role

**BR-020: Assignment Role**
- Setiap user harus minimal punya 1 role
- User dapat memiliki multiple roles
- Permission user adalah gabungan dari semua roles yang dimiliki
- Perubahan role langsung berlaku (invalidate cache)

**BR-021: System Roles**
- System roles (Super Admin, Tenant Admin, User, Guest) tidak dapat dihapus
- System roles hanya bisa diupdate description-nya
- Custom roles dapat dibuat per tenant
- Custom roles hanya berlaku dalam tenant tersebut

---

## 3. Aturan Setiap Modul

### 3.1 Modul Authentication

**BR-022: Registration**
- User baru otomatis mendapat role default "User"
- Email harus unique dalam satu tenant
- Email tidak case-sensitive (convert ke lowercase)
- Password tidak boleh sama dengan email
- User baru status inactive sampai email verified (Phase 2)

**BR-023: Login**
- Email dan password required
- Rate limiting: max 5 attempts dalam 15 menit per email
- Failed login di-log untuk security monitoring
- Login sukses reset failed attempt counter

**BR-024: Password Reset**
- Reset token hanya valid 1 jam
- Reset token hanya bisa dipakai sekali
- Setelah password reset, semua session user harus di-invalidate
- User harus login ulang dengan password baru

### 3.2 Modul User Management

**BR-025: Create User**
- Hanya Tenant Admin dan Super Admin yang boleh create user
- User baru harus di-assign minimal 1 role
- Email harus unique dalam tenant
- Password bisa di-generate otomatis atau input manual

**BR-026: Update User**
- Email tidak bisa diubah (immutable)
- User hanya bisa update profile sendiri (full_name, phone, avatar)
- Admin dapat update user lain dalam tenant
- Update user tidak affect password (password change terpisah)

**BR-027: Delete User**
- Delete adalah soft delete (set deleted_at)
- User yang di-delete tidak bisa login
- Semua session user yang di-delete harus di-invalidate
- Data yang dibuat user tidak ikut terhapus (preserve data integrity)

**BR-028: Restore User**
- Hanya deleted users yang bisa di-restore
- Restore set deleted_at = NULL
- User dapat login kembali setelah di-restore
- Restore tidak otomatis reactive sessions (user harus login ulang)

**BR-029: Activate/Deactivate User**
- Inactive user tidak dapat login
- Deactivate user invalidate semua sessions
- Activate user tidak otomatis create session (user harus login)
- Admin tidak bisa deactivate diri sendiri

### 3.3 Modul Role dan Permission

**BR-030: Create Role**
- Custom roles hanya bisa dibuat per tenant
- System roles tidak bisa diduplikasi
- Role name harus unique dalam tenant
- Role baru tidak punya permissions (harus di-assign manual)

**BR-031: Delete Role**
- Hanya custom roles yang bisa dihapus
- Role tidak bisa dihapus jika masih ada user dengan role tersebut
- Delete role adalah soft delete
- System roles tidak bisa dihapus

**BR-032: Assign Permissions**
- Permissions di-assign ke role, bukan langsung ke user
- Perubahan permissions pada role langsung affect semua user dengan role tersebut
- Permission terdiri dari: resource, action, scope
- Scope: own (data sendiri), tenant (data dalam tenant), all (semua data)

**BR-033: Check Permission**
- Permission check dilakukan setiap action
- User dengan multiple roles mendapat kombinasi permissions dari semua roles
- Permission denied return error 403 dengan message jelas
- Audit log mencatat setiap permission denied

### 3.4 Modul Multi-Tenancy

**BR-034: Create Tenant**
- Hanya Super Admin yang boleh create tenant
- Slug auto-generated dari name (lowercase, dash-separated)
- Schema name format: tenant_{slug}
- Tenant baru otomatis dapat Tenant Admin user
- Tenant baru status active by default

**BR-035: Delete Tenant**
- Delete tenant adalah soft delete
- Harus ada konfirmasi (type tenant name untuk konfirmasi)
- Delete tenant tidak delete schema (hanya mark inactive)
- Semua users dalam tenant di-soft delete juga
- Tenant yang di-delete tidak bisa diakses

**BR-036: Restore Tenant**
- Restore tenant juga restore users yang di-delete bersamaan
- Schema tetap utuh (hanya change status)
- Tenant yang di-restore kembali accessible

### 3.5 Modul Master Data

**BR-037: Categories**
- Categories support hierarchy (parent-child)
- Category name harus unique dalam tenant
- Delete category adalah soft delete
- Category dengan children tidak bisa dihapus (delete children dulu)

**BR-038: Tags**
- Tags dapat di-attach ke multiple entities
- Tag name harus unique dalam tenant
- Delete tag adalah soft delete
- Delete tag tidak delete entities yang menggunakan tag

### 3.6 Modul Security

**BR-039: Input Sanitization**
- Semua input harus di-sanitize otomatis
- HTML tags di-strip kecuali whitelist tags
- Special characters di-escape
- No exception untuk any role

**BR-040: Rate Limiting**
- Rate limiting per tenant dan per endpoint
- Default limit: 1000 requests per menit per tenant
- Login endpoint: 5 attempts per 15 menit
- Rate limit exceeded return 429 status

### 3.7 Modul Audit Log

**BR-041: View Audit Logs**
- Super Admin dapat melihat audit logs semua tenant
- Tenant Admin hanya melihat audit logs tenant sendiri
- User biasa tidak dapat akses audit logs
- Audit logs read-only (tidak bisa diedit/delete)

**BR-042: Retention Audit Log**
- Audit logs disimpan minimal 1 tahun
- Audit logs > 1 tahun bisa di-archive (Phase 2)
- Archive logs compressed dan stored separately

### 3.8 Modul Dashboard

**BR-043: Dashboard Content**
- Dashboard content berbeda per role
- Super Admin: global statistics (all tenants)
- Tenant Admin: tenant statistics
- User: own profile summary dan activities
- Dashboard data real-time atau cached (max 5 menit)

### 3.9 Modul Settings

**BR-044: System Settings**
- Hanya Super Admin yang dapat manage system settings
- System settings apply globally ke semua tenants
- Perubahan system settings langsung berlaku

**BR-045: Tenant Settings**
- Tenant Admin dapat manage tenant settings
- Tenant settings hanya affect tenant sendiri
- Tenant settings stored dalam JSONB (flexible structure)

### 3.10 Modul Module Management

**BR-046: Register Module**
- Module baru otomatis registered via CLI saat generate
- Module tersimpan di global table modules
- Module memiliki permissions default (create, read, update, delete)
- Module bisa assigned ke subscription tier

**BR-047: Enable/Disable Module**
- Tenant Admin dapat enable/disable modules untuk tenant sendiri
- Core modules tidak bisa disabled (authentication, user management, dll)
- Module yang disabled tidak accessible (403 error)
- Enable/disable module langsung affect menu sidebar

**BR-048: Module Guard**
- Setiap request check apakah module enabled untuk tenant
- Module disabled return 403 Forbidden
- Module check di-cache untuk performance
- Cache invalidate saat enable/disable module

**BR-049: Module Permissions**
- Permission di-link ke module
- Disable module tidak affect permissions yang sudah di-assign
- Enable module tidak otomatis assign permissions (manual assign)

---

## 4. Aturan Status Data

### 4.1 Status User

**BR-050: Status User**
- **Active (is_active = true)**: User dapat login dan menggunakan sistem
- **Inactive (is_active = false)**: User tidak dapat login, semua sessions invalid
- **Deleted (deleted_at NOT NULL)**: User tidak muncul di list, tidak dapat login, bisa di-restore
- **Unverified**: Email belum verified (Phase 2), user bisa login tapi ada batasan

**BR-051: Transisi Status User**
- Active → Inactive: By Tenant Admin atau Super Admin
- Inactive → Active: By Tenant Admin atau Super Admin
- Active → Deleted: Soft delete operation
- Deleted → Active: Restore operation

### 4.2 Status Tenant

**BR-052: Status Tenant**
- **Active (is_active = true)**: Tenant dapat diakses, users dapat login
- **Inactive (is_active = false)**: Tenant tidak dapat diakses, semua users tidak dapat login
- **Deleted (deleted_at NOT NULL)**: Tenant tidak muncul di list, tidak accessible, bisa di-restore

**BR-053: Transisi Status Tenant**
- Active → Inactive: By Super Admin (manual deactivation)
- Inactive → Active: By Super Admin
- Active → Deleted: Soft delete by Super Admin
- Deleted → Active: Restore by Super Admin

### 4.3 Status Role

**BR-054: Status Role**
- **Active**: Role dapat di-assign ke users
- **Deleted (deleted_at NOT NULL)**: Role tidak muncul di list, tidak dapat di-assign, bisa di-restore (hanya custom roles)

### 4.4 Status Module

**BR-055: Status Module (Global)**
- **Active (is_active = true)**: Module available untuk di-enable per tenant
- **Inactive (is_active = false)**: Module tidak available, tidak bisa di-enable

**BR-056: Status Module per Tenant**
- **Enabled (tenant_modules.is_enabled = true)**: Module accessible dalam tenant
- **Disabled (tenant_modules.is_enabled = false)**: Module tidak accessible dalam tenant

### 4.5 Status Session

**BR-057: Status Session**
- **Active**: Session valid, user dapat akses sistem
- **Expired**: Session melewati expiration time, user harus login ulang
- **Invalidated**: Session di-logout manual atau user deactivated

---

## 5. Aturan Approval (Phase 2)

**Note**: Approval workflow tidak termasuk MVP Phase 1. Rules ini untuk Phase 2.

**BR-058: Approval Flow (Future)**
- Data yang butuh approval tidak langsung active
- Data submitted dengan status "Pending Approval"
- Approver di-determine berdasarkan approval rules
- Approver dapat approve atau reject
- Reject harus ada reason
- Setelah approved, data status berubah menjadi "Active"

**BR-059: Approver Rules (Future)**
- Approver based on role atau org structure
- Approver tidak bisa approve submission sendiri
- Multi-level approval possible (Phase 2)

---

## 6. Aturan Pembatalan/Penolakan

### 6.1 Pembatalan Operations

**BR-060: Cancel Create**
- User dapat cancel form create sebelum submit
- Cancel tidak save data ke database
- No audit log untuk cancel

**BR-061: Cancel Update**
- User dapat cancel form update sebelum submit
- Data kembali ke state original
- No audit log untuk cancel

### 6.2 Penolakan Access

**BR-062: Permission Denied**
- Jika user tidak punya permission, return 403 Forbidden
- Error message harus jelas: "Anda tidak memiliki akses untuk [action] [resource]"
- Audit log mencatat permission denied
- Frontend hide atau disable UI elements yang tidak di-allow

**BR-063: Module Disabled**
- Jika module disabled untuk tenant, return 403 Forbidden
- Error message: "Module ini tidak tersedia untuk tenant Anda"
- Audit log mencatat module access denied

**BR-064: Tenant Inactive**
- Jika tenant inactive, semua users tidak dapat login
- Login attempt return error: "Tenant tidak aktif"
- Existing sessions di-invalidate

**BR-065: User Inactive**
- Jika user inactive, login denied
- Error message: "Akun Anda tidak aktif. Hubungi administrator."
- Existing sessions di-invalidate

---

## 7. Aturan Upload File

**BR-066: File Upload Allowed**
- User dapat upload file jika punya permission
- File types allowed: images (jpg, png, gif), documents (pdf, docx), archives (zip)
- Max file size configurable per tenant (default 5MB)

**BR-067: File Validation**
- Validate file type by extension dan MIME type
- Validate file size before upload
- Generate safe filename (remove special chars)
- Scan file untuk malware (Phase 2)

**BR-068: File Storage**
- Files stored dengan unique filename (prevent overwrite)
- File metadata stored di database (original name, size, type, uploader)
- Files stored per tenant (tenant isolation)

**BR-069: File Delete**
- Delete file adalah soft delete file record
- Physical file tidak dihapus (untuk recovery)
- Old files dapat di-cleanup dengan background job (Phase 2)

**BR-070: File Access**
- File hanya accessible oleh users dalam tenant yang sama
- File access check permissions
- Direct file URL harus protected (not public)

---

## 8. Aturan Generate Dokumen (Phase 2)

**Note**: Document generation tidak termasuk MVP Phase 1.

**BR-071: Export to CSV/Excel (Future)**
- User dengan permission dapat export data
- Export apply same filters dari current list view
- Export limited to max 10,000 rows (prevent memory issue)
- Export di-audit log

**BR-072: Generate PDF Report (Future)**
- User dengan permission dapat generate report
- Report template pre-defined
- Report generation asynchronous (background job)
- User di-notify saat report ready

**BR-073: Document Templates (Future)**
- Document templates managed by Admin
- Templates support variables (user name, tenant name, dll)
- Template changes tidak affect documents yang sudah di-generate

---

## 9. Aturan Notifikasi

### 9.1 In-App Notification (Phase 1 - Basic)

**BR-074: Receive Notification**
- System events trigger notification creation
- Notification stored di database
- Notification types: info, success, warning, error
- User melihat notifications via bell icon

**BR-075: Read Notification**
- Klik notification mark as read (set read_at)
- Unread notifications show counter badge
- Notification dapat di-link ke resource

**BR-076: Delete Notification**
- User dapat delete own notifications
- Delete notification adalah soft delete
- System dapat auto-delete old notifications (>30 hari)

### 9.2 Email Notification (Phase 2)

**BR-077: Email Triggers (Future)**
- Welcome email saat user created
- Password reset email
- Important system notifications
- User dapat configure email preferences

**BR-078: Email Queue (Future)**
- Emails queued dengan background job
- Failed emails auto-retry dengan backoff
- Email delivery status tracked

---

## 10. Aturan Data yang Tidak Boleh Dihapus

### 10.1 System Data

**BR-079: System Roles**
- System roles (Super Admin, Tenant Admin, User, Guest) tidak boleh dihapus
- System roles hanya bisa update description
- Attempt delete system role return error

**BR-080: System Permissions**
- System permissions tidak boleh dihapus
- System permissions immutable
- Custom permissions dapat dihapus (soft delete)

**BR-081: Tenant Schema**
- Tenant schema tidak boleh di-drop
- Soft delete tenant hanya mark inactive
- Schema cleanup manual by Super Admin jika benar-benar butuh

### 10.2 Data dengan Dependency

**BR-082: Role dengan Users**
- Role yang masih di-assign ke users tidak boleh dihapus
- Must unassign role dari all users dulu
- System check dependencies sebelum delete

**BR-083: Category dengan Children**
- Category dengan children tidak boleh dihapus
- Must delete children dulu atau reassign parent
- System prevent delete parent category

**BR-084: User dengan Data**
- User yang sudah create data tidak boleh hard delete (hanya soft delete)
- Data yang dibuat user harus preserve integrity (keep created_by reference)

### 10.3 Audit Data

**BR-085: Audit Logs**
- Audit logs tidak boleh dihapus oleh users
- Audit logs read-only
- Audit logs cleanup hanya by automated retention policy (jika ada)

**BR-086: Session History**
- Session records tidak boleh dihapus manual
- Session cleanup otomatis setelah expired
- Active sessions tidak boleh dihapus (harus logout dulu)

---

## 11. Aturan Audit Log

### 11.1 Yang Harus Di-audit

**BR-087: Authentication Events**
- Login sukses: user_id, timestamp, IP, user agent
- Login gagal: email attempted, timestamp, IP, reason
- Logout: user_id, timestamp
- Password reset: user_id, timestamp, IP
- Password change: user_id, timestamp

**BR-088: Authorization Events**
- Permission denied: user_id, resource, action, timestamp
- Role assigned: user_id, role_id, by_user_id, timestamp
- Role removed: user_id, role_id, by_user_id, timestamp
- Permission changed: role_id, permissions, by_user_id, timestamp

**BR-089: CRUD Operations**
- Create: user_id, tenant_id, resource, resource_id, data snapshot, timestamp
- Update: user_id, tenant_id, resource, resource_id, before/after values, timestamp
- Delete: user_id, tenant_id, resource, resource_id, timestamp
- Restore: user_id, tenant_id, resource, resource_id, timestamp

**BR-090: Configuration Changes**
- System settings change: by_user_id, setting_key, before/after value, timestamp
- Tenant settings change: by_user_id, tenant_id, setting_key, before/after value, timestamp
- Module enable/disable: by_user_id, tenant_id, module_id, action, timestamp

**BR-091: Sensitive Operations**
- Super Admin akses ke tenant lain: user_id, tenant_id, resource, timestamp
- Mass delete operations: user_id, resource, count, timestamp
- Data export: user_id, resource, filters, timestamp

### 11.2 Informasi Audit

**BR-092: Audit Log Fields**
- id: unique identifier
- user_id: yang melakukan action
- tenant_id: tenant context
- action: jenis operation (create, update, delete, login, dll)
- resource: entity type (users, roles, tenants, dll)
- resource_id: ID entity yang di-affect
- changes: JSONB dengan before/after values (untuk update)
- ip_address: IP address user
- user_agent: browser/client info
- created_at: timestamp

**BR-093: Audit Log Retention**
- Audit logs disimpan minimal 1 tahun
- Audit logs > 1 tahun dapat di-archive (compress dan store separately)
- Archive audit logs tetap accessible jika dibutuhkan
- Audit logs tidak boleh dihapus oleh users

### 11.3 Akses Audit Log

**BR-094: View Audit Logs**
- Super Admin: dapat view audit logs semua tenants
- Tenant Admin: dapat view audit logs tenant sendiri saja
- User biasa: tidak dapat view audit logs
- Audit logs support filtering: by user, by action, by resource, by date range

**BR-095: Audit Log Security**
- Audit logs read-only
- No edit atau delete operations allowed
- Attempt to modify audit log di-log sebagai security incident
- Audit log access juga di-audit

---

## Ringkasan Aturan Kritis

### Must Follow (Non-Negotiable)

1. **BR-001**: Isolasi data tenant WAJIB - no cross-tenant access
2. **BR-004**: Soft delete mandatory - no hard delete untuk data krusial
3. **BR-007**: Audit trail untuk semua critical operations
4. **BR-009**: User hanya login jika active dan tenant active
5. **BR-020**: Setiap user minimal 1 role
6. **BR-027**: Delete user adalah soft delete
7. **BR-039**: Input sanitization untuk semua input
8. **BR-048**: Module disabled return 403 Forbidden
9. **BR-079**: System roles tidak boleh dihapus
10. **BR-085**: Audit logs read-only, tidak boleh dihapus users

### Business Logic Priorities

**P0 (Critical)**:
- Multi-tenancy isolation
- Soft delete implementation
- Audit logging
- Permission checking

**P1 (High)**:
- Role-based access control
- Module enable/disable
- User activation/deactivation
- Session management

**P2 (Medium)**:
- Notification rules
- File upload rules
- Dashboard rules

**P3 (Low - Phase 2+)**:
- Approval workflow
- Document generation
- Email notifications

---

## Catatan untuk Developer

### Interpretasi Aturan

1. **Jika aturan tidak jelas**, prioritaskan:
   - Security first
   - Data integrity
   - User experience
   - Konsultasi dengan product owner

2. **Jika aturan bertentangan**, prioritas:
   - Security rules > Business rules > UX rules
   - Explicit rules > Implicit rules
   - Documented rules > Assumed rules

3. **Jika edge case tidak tercakup**:
   - Follow pattern dari aturan similar
   - Default ke restrictive (deny by default)
   - Document decision dan propose rule addition

### Testing Business Rules

Setiap business rule harus punya test case:
- Unit test untuk logic
- Integration test untuk workflow
- E2E test untuk critical paths

---

## Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Product Manager | TBD | ⏳ Pending | - |
| Business Analyst | TBD | ⏳ Pending | - |
| Technical Lead | TBD | ⏳ Pending | - |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-01-08 | Initial business rules document | Business Analyst |

---

**Status**: ✅ Draft Complete - Ready for Review  
**Next Steps**: Review dengan stakeholders, incorporate feedback, final approval

---

*Dokumen ini adalah Business Rules yang harus diikuti oleh sistem. Untuk detail API dan validasi teknis, lihat API-CONTRACT.md. Untuk flow detail, lihat USER-FLOW.md.*
