# USER FLOW
# Platform CMS - Core Framework

**Document Version**: 1.0
**Last Updated**: 2024-01-08
**Status**: User Flow Specification
**Reference**: PROJECT-BRIEF.md, PRD.md, FEATURE-LIST.md

---

## Pendahuluan

Dokumen ini menjelaskan alur pengguna (user flow) untuk Platform CMS dari awal sampai akhir. Setiap flow menggambarkan langkah-langkah yang dilakukan user untuk mencapai tujuan tertentu.

### Roles yang Dibahas

1. **Super Admin** - Administrator tertinggi, manage semua tenants
2. **Tenant Admin** - Administrator per tenant, manage users dalam tenant
3. **User (Regular)** - Pengguna biasa dengan permissions terbatas
4. **Guest** - Visitor dengan akses read-only (optional)

### Notasi Diagram



---

## 1. Flow Login

### 1.1 Login Flow (Normal)

**Tujuan**: User login ke sistem dengan email dan password

**Langkah**:

1. User membuka aplikasi di browser
2. System redirect ke halaman login (jika belum authenticated)
3. User melihat form login dengan fields:
   - Email
   - Password
   - Remember me (checkbox, optional)
4. User mengisi email dan password
5. User klik tombol Login
6. System validasi input:
   - Email format valid
   - Password tidak kosong
7. System kirim request ke backend
8. Backend validasi credentials:
   - Check email exists
   - Check password match (bcrypt verify)
   - Check user active (is_active = true)
   - Check tenant active
9. Backend generate JWT token
10. Backend create session di Redis
11. Backend return token dan user data
12. Frontend simpan token di HTTP-only cookie
13. Frontend simpan user data di state (Zustand)
14. System redirect ke dashboard sesuai role
15. Audit log: Login success

**Diagram**:



---

### 1.2 Login Flow (Error - Invalid Credentials)

**Langkah**:

1-7. (Sama seperti normal flow)
8. Backend validasi credentials: Email atau password salah
9. Backend increment failed login counter
10. Backend check rate limiting (5 attempts per 15 menit)
11. Backend return error response:
    
12. Frontend tampilkan error message di atas form (toast atau inline)
13. Form tetap terisi (email), password di-clear
14. User bisa coba login lagi
15. Audit log: Login failed (email, IP address)

**Diagram**:



---

### 1.3 Login Flow (Error - Account Inactive)

**Langkah**:

1-7. (Sama seperti normal flow)
8. Backend check: User is_active = false atau tenant is_active = false
9. Backend return error response:
    
10. Frontend tampilkan error message
11. Frontend tampilkan link Hubungi Admin (jika ada)
12. Audit log: Login attempt - account inactive

---

### 1.4 First Time Login Flow

**Langkah**:

1-14. (Sama seperti normal login)
15. System detect: First login (last_login_at is NULL)
16. System redirect ke halaman Welcome atau Profile Setup
17. User diminta lengkapi profile:
    - Upload avatar (optional)
    - Update phone number (optional)
    - Set preferences (optional)
18. User klik Simpan atau Skip
19. System update user profile
20. System redirect ke dashboard
21. Audit log: First login, profile updated

---

## 2. Flow Dashboard Berdasarkan Role

### 2.1 Dashboard Super Admin

**Tujuan**: Super Admin melihat overview seluruh platform

**Langkah**:

1. User login sebagai Super Admin
2. System redirect ke /dashboard
3. System load data dashboard:
   - Total tenants (active, inactive)
   - Total users across all tenants
   - New tenants this month
   - New users this month
   - System health metrics (API response time, DB query time, memory usage)
   - Recent activities (all tenants)
4. Dashboard menampilkan widgets:
   - Statistics cards (tenants, users, activity)
   - Charts (tenants growth, users growth)
   - Recent activities table
   - System health indicators
5. Super Admin melihat menu sidebar:
   - Dashboard
   - Tenant Management (CRUD tenants)
   - User Management (all users)
   - Role Management (system roles)
   - Audit Logs (all tenants)
   - System Settings
   - API Documentation
6. Super Admin bisa klik widget untuk detail
7. Super Admin bisa navigate ke module lain via sidebar

**Diagram**:



---

### 2.2 Dashboard Tenant Admin

**Tujuan**: Tenant Admin melihat overview tenant sendiri

**Langkah**:

1. User login sebagai Tenant Admin
2. System redirect ke /dashboard
3. System extract tenant dari JWT token
4. System load data dashboard (tenant-specific):
   - Total users dalam tenant
   - Active users dalam tenant
   - New users this month
   - Recent activities (tenant only)
   - Storage usage
5. Dashboard menampilkan widgets:
   - User statistics
   - Activity timeline
   - Quick actions (Add User, Manage Roles)
6. Tenant Admin melihat menu sidebar:
   - Dashboard
   - User Management (tenant users only)
   - Role Management (tenant roles only)
   - Master Data
   - Audit Logs (tenant only)
   - Tenant Settings
7. Tenant Admin bisa navigate ke module lain

**Diagram**:



---

### 2.3 Dashboard User (Regular)

**Tujuan**: User regular melihat dashboard sesuai permissions

**Langkah**:

1. User login sebagai Regular User
2. System redirect ke /dashboard
3. System load data sesuai permissions:
   - Own profile summary
   - Recent own activities
   - Assigned tasks (jika ada module task)
   - Quick links ke allowed features
4. Dashboard menampilkan:
   - Welcome message
   - Profile card
   - Recent activity
   - Quick actions (sesuai permissions)
5. User melihat menu sidebar (filtered by permissions):
   - Dashboard
   - Master Data (if has read permission)
   - Own Profile
   - Allowed modules only
6. User bisa navigate ke allowed modules

**Diagram**:



---

## 3. Flow Utama User

### 3.1 Flow CRUD Data (Create)

**Tujuan**: User create data baru

**Langkah**:

1. User login dan di dashboard
2. User klik menu module (contoh: User Management)
3. System load list page dengan table
4. User klik tombol Tambah atau Create New
5. System redirect ke form create page
6. User melihat form dengan fields sesuai entity
7. User mengisi form fields
8. System validasi real-time (per field):
   - Required fields
   - Format validation (email, phone, dll)
   - Min/max length
9. User klik tombol Simpan
10. System validasi final (backend):
    - Check permissions (can create?)
    - Validate all fields dengan Zod schema
    - Sanitize input (XSS prevention)
    - Check unique constraints (email, slug, dll)
11. System save data ke database:
    - Set created_by = current user
    - Set created_at = now
    - Set tenant_id = current tenant
12. System return success response
13. Frontend show success toast: Data berhasil disimpan
14. Frontend redirect ke list page atau detail page
15. Audit log: Data created

**Diagram**:



---

### 3.2 Flow CRUD Data (Read List)

**Langkah**:

1. User klik menu module
2. System load list page
3. System fetch data dengan pagination:
   - Default: 10 items per page
   - Only data dalam tenant (tenant isolation)
   - Only data yang belum di-delete (deleted_at IS NULL)
   - Apply permission filter (own vs tenant vs all)
4. System render table dengan columns
5. User melihat:
   - Search box (search by name atau field lain)
   - Filter dropdowns (status, role, dll)
   - Sort indicators per column (asc/desc)
   - Pagination controls (prev, next, page numbers)
   - Action buttons per row (View, Edit, Delete)
6. User bisa:
   - Search data
   - Filter data
   - Sort data
   - Navigate pages
   - Klik View untuk detail
   - Klik Edit untuk update
   - Klik Delete untuk soft delete

**Diagram**:



---

### 3.3 Flow CRUD Data (Read Detail)

**Langkah**:

1. User di list page
2. User klik tombol View atau klik row
3. System redirect ke detail page dengan ID
4. System fetch data by ID:
   - Check permissions (can read?)
   - Check tenant (tenant isolation)
   - Check not deleted
5. System render detail page:
   - Display semua fields
   - Display metadata (created_by, created_at, updated_by, updated_at)
   - Display related data (roles, permissions, dll)
   - Action buttons (Edit, Delete, Back)
6. User melihat detail lengkap
7. User bisa klik Edit atau Delete atau Back

---

### 3.4 Flow CRUD Data (Update)

**Langkah**:

1. User di detail page atau list page
2. User klik tombol Edit
3. System redirect ke form edit page
4. System fetch data by ID (sama seperti detail)
5. System populate form dengan data existing
6. User modify fields
7. System validasi real-time (sama seperti create)
8. User klik Simpan
9. System validasi final:
   - Check permissions (can update?)
   - Check data masih exists dan not deleted
   - Check optimistic locking (updated_at match?)
   - Validate fields
   - Sanitize input
10. System update data:
    - Set updated_by = current user
    - Set updated_at = now
    - Only update changed fields
11. System return success
12. Frontend show toast: Data berhasil diupdate
13. Frontend redirect ke detail atau list
14. Audit log: Data updated (with before/after values)

**Diagram**:



---

### 3.5 Flow CRUD Data (Soft Delete)

**Langkah**:

1. User di detail page atau list page
2. User klik tombol Delete (icon trash)
3. System show confirmation modal:
   - Message: Apakah Anda yakin ingin menghapus data ini?
   - Info: Data akan disembunyikan tapi bisa di-restore
   - Buttons: Batal, Ya Hapus
4. User klik Ya Hapus
5. System kirim delete request
6. System validasi:
   - Check permissions (can delete?)
   - Check data exists dan not deleted
   - Check dependencies (cascade delete atau block?)
7. System soft delete:
   - Set deleted_at = now
   - Set deleted_by = current user
   - Cascade soft delete ke related entities (jika configured)
8. System invalidate caches
9. System return success
10. Frontend show toast: Data berhasil dihapus
11. Frontend remove row dari table atau redirect ke list
12. Audit log: Data deleted

**Diagram**:



---

### 3.6 Flow Restore Deleted Data

**Langkah**:

1. User di list page
2. User toggle filter: Tampilkan Data Terhapus
3. System reload data dengan filter deleted_at IS NOT NULL
4. System render table dengan status Terhapus
5. User melihat deleted data dengan warna berbeda (misal: text abu-abu)
6. User klik tombol Restore (icon undo)
7. System show confirmation: Apakah Anda yakin restore data ini?
8. User klik Ya
9. System validasi:
   - Check permissions (can restore?)
   - Check data exists dan is deleted
10. System restore:
    - Set deleted_at = NULL
    - Set deleted_by = NULL
11. System return success
12. Frontend show toast: Data berhasil di-restore
13. Frontend refresh list (data kembali ke normal list)
14. Audit log: Data restored

---

## 4. Flow Admin/Operator

### 4.1 Flow Super Admin: Create Tenant

**Tujuan**: Super Admin onboard tenant baru

**Langkah**:

1. Super Admin login
2. Super Admin navigate ke Tenant Management
3. Super Admin klik Create Tenant
4. Super Admin isi form:
   - Tenant Name (required)
   - Domain (optional, untuk custom domain)
   - Subscription Tier (dropdown: Free, Basic, Pro)
   - Subscription Expires At (date picker)
5. System auto-generate slug dari name (lowercase, dash-separated)
6. Super Admin klik Simpan
7. System validasi:
   - Name unique
   - Slug unique
   - Domain unique (jika diisi)
8. System create tenant:
   - Insert tenant record
   - Generate schema_name (tenant_xxx)
   - Create PostgreSQL schema
   - Run migrations di schema baru
   - Setup default roles (Tenant Admin, User)
   - Setup default permissions
9. System create tenant admin user:
   - Email: admin@tenant-slug.com (auto-generated)
   - Password: random (will be sent via email di Phase 2)
   - Role: Tenant Admin
10. System return success dengan tenant details
11. Frontend show success: Tenant berhasil dibuat
12. Frontend show tenant credentials (copy to clipboard)
13. Frontend redirect ke tenant list
14. Audit log: Tenant created

**Diagram**:



---

### 4.2 Flow Tenant Admin: Manage Users

**Tujuan**: Tenant Admin create dan manage users dalam tenant

**Langkah Create User**:

1. Tenant Admin login
2. Tenant Admin navigate ke User Management
3. Tenant Admin klik Create User
4. Tenant Admin isi form:
   - Email (required, unique dalam tenant)
   - Full Name (required)
   - Phone (optional)
   - Role (dropdown, multiple select)
   - Generate Password (checkbox, auto-generate atau manual)
5. Tenant Admin klik Simpan
6. System validasi:
   - Email unique dalam tenant
   - At least 1 role assigned
7. System create user:
   - Hash password
   - Set tenant_id = current tenant
   - Set created_by = current admin
8. System assign roles
9. System send welcome email (Phase 1: log only)
10. System return success
11. Frontend show success: User berhasil dibuat
12. Frontend show credentials jika auto-generated
13. Audit log: User created by Tenant Admin

**Langkah Assign Role**:

1. Tenant Admin di user detail atau list
2. Tenant Admin klik Manage Roles
3. System show modal dengan list roles (tenant roles only)
4. Tenant Admin select/unselect roles (multiple)
5. Tenant Admin klik Simpan
6. System validasi: minimal 1 role
7. System update user_roles junction table
8. Changes langsung berlaku (invalidate user session)
9. Frontend show success
10. Audit log: Roles assigned/removed

**Langkah Deactivate User**:

1. Tenant Admin di user list
2. Tenant Admin klik toggle Status atau Action > Deactivate
3. System show confirmation
4. Tenant Admin confirm
5. System set is_active = false
6. System invalidate user sessions (logout user)
7. Frontend show success: User dinonaktifkan
8. Audit log: User deactivated

---

### 4.3 Flow Super Admin: Register Module (via CLI)

**Tujuan**: Register module baru ke database saat generate via CLI

**Langkah**:

1. Developer run CLI command:  
   `platform-cli generate:module products`
2. CLI generate code files (controller, service, repository, entity, DTO)
3. CLI auto-register module ke database:
   - Insert ke table `modules`
   - name: 'products'
   - display_name: 'Product Management'
   - route_prefix: '/products'
   - icon: 'package'
   - is_core: false
   - version: '1.0.0'
4. CLI auto-create permissions:
   - Insert ke table `module_permissions`
   - products.create, products.read, products.update, products.delete
5. CLI success message dengan module details
6. Module sekarang available untuk di-enable per tenant
7. Audit log: Module registered

**Diagram**:

```
[CLI Generate] --> [Generate Code Files]
    --> [Register to modules table]
    --> [Create Permissions]
    --> [Success Message]
```

---

### 4.4 Flow Tenant Admin: Enable/Disable Module

**Tujuan**: Tenant Admin enable atau disable module untuk tenant

**Langkah Enable Module**:

1. Tenant Admin login
2. Tenant Admin navigate ke Settings > Modules
3. System show list available modules:
   - Filter by subscription tier (only show allowed modules)
   - Core modules (marked, cannot disable)
   - Optional modules dengan toggle
4. Tenant Admin toggle ON untuk module "Product Management"
5. System check:
   - Subscription tier allows module?
   - Module is_active globally?
6. System show confirmation: Enable Product Management?
7. Tenant Admin confirm
8. System enable module:
   - Insert/Update tenant_modules
   - is_enabled = true
   - enabled_at = now
   - enabled_by = current admin
9. System return success
10. Frontend refresh menu sidebar (auto-show new menu item)
11. Frontend show success toast: Module berhasil diaktifkan
12. Audit log: Module enabled

**Langkah Disable Module**:

1. Tenant Admin toggle OFF untuk module
2. System check: Bukan core module?
3. System show confirmation: Disable module ini?
4. Tenant Admin confirm
5. System disable:
   - Update tenant_modules: is_enabled = false
   - disabled_at = now
   - disabled_by = current admin
6. System return success
7. Frontend remove menu item dari sidebar
8. Frontend show success: Module dinonaktifkan
9. Audit log: Module disabled

**Diagram**:

```
[Settings > Modules] --> [List Available Modules]
    --> [Toggle Module] --> {Enable atau Disable?}
        --> Enable: [Check Subscription] --> [Enable Module]
            --> [Refresh Menu] --> [Show New Menu Item]
        --> Disable: [Check Not Core] --> [Disable Module]
            --> [Remove Menu Item]
```

---

### 4.5 Flow System: Module Guard Check

**Tujuan**: System check module enabled sebelum allow route access

**Langkah**:

1. User navigate ke route `/products`
2. Request hit backend API
3. Module Guard Middleware triggered:
   - Extract tenant dari JWT token
   - Extract module dari route (/products → "products" module)
4. System check cache (Redis):
   - Key: `tenant:{tenant_id}:modules:enabled`
   - Check if "products" in cached list
5. Jika not in cache:
   - Query database: tenant_modules
   - Check: tenant_id + module_id + is_enabled = true
   - Cache result di Redis (TTL: 5 minutes)
6. System evaluate:
   - Module enabled? → Continue to controller
   - Module disabled? → Return 403 Forbidden
7. Jika disabled:
   - Response: {error: "Module tidak tersedia untuk tenant ini"}
   - Frontend show 403 page
   - Audit log: Module access denied
8. Jika enabled:
   - Request proceed to controller
   - Normal flow continues

**Diagram**:

```
[User Request /products] --> [Module Guard]
    --> [Extract Tenant & Module] --> [Check Cache]
    --> {Module Enabled?}
        --> Yes: [Allow Access] --> [Controller]
        --> No: [403 Forbidden] --> [Error Page]
```

---

## 5. Flow Approval (Phase 2 - Out of MVP Scope)

**Note**: Approval workflow tidak termasuk MVP Phase 1, tapi didokumentasikan untuk Phase 2.

### 5.1 Flow Submit untuk Approval

**Tujuan**: User submit data untuk di-approve oleh approver

**Langkah** (Phase 2):

1. User create atau update data
2. User klik Submit untuk Approval (bukan langsung Simpan)
3. System save data dengan status: Pending Approval
4. System determine approver:
   - Based on approval rules (amount, type, dll)
   - Based on org structure (manager, supervisor)
5. System create approval request record
6. System notify approver (email + in-app notification)
7. Frontend show success: Data dikirim untuk approval
8. User melihat data dengan status Pending
9. Audit log: Submitted for approval

### 5.2 Flow Approve/Reject

**Langkah** (Phase 2):

1. Approver menerima notification
2. Approver login dan ke Approval Queue
3. Approver melihat list pending approvals
4. Approver klik Review
5. Approver melihat detail data dan changes
6. Approver review data
7. Approver decide: Approve atau Reject
8. Jika Reject: Approver isi rejection reason
9. Approver klik Submit
10. System update approval status
11. System notify submitter
12. Jika Approved: Data status = Active
13. Jika Rejected: Data status = Rejected, dapat di-edit dan resubmit
14. Audit log: Approved/Rejected dengan reason

**Diagram** (Phase 2):



---

## 6. Flow Generate Dokumen (Phase 2 - Out of MVP Scope)

**Note**: Document generation tidak termasuk MVP Phase 1.

### 6.1 Flow Export to CSV/Excel (Phase 2)

**Langkah**:

1. User di list page (misal: User List)
2. User apply filters jika perlu (filter by role, status, dll)
3. User klik tombol Export
4. System show modal: Pilih format (CSV, Excel, PDF)
5. User select format
6. User klik Export
7. System validasi: Check permissions (can export?)
8. System generate file:
   - Apply same filters dari list
   - Fetch data (with pagination untuk large dataset)
   - Format data sesuai template
   - Generate file (in-memory atau temp file)
9. System return download link atau direct download
10. Frontend trigger download
11. User save file
12. Audit log: Data exported

### 6.2 Flow Generate Report PDF (Phase 2)

**Langkah**:

1. User navigate ke Reports module
2. User select report type (User Report, Activity Report, dll)
3. User set parameters:
   - Date range
   - Filters
   - Group by options
4. User klik Preview
5. System generate preview (HTML)
6. User review preview
7. User klik Generate PDF
8. System:
   - Render HTML to PDF (Puppeteer atau library lain)
   - Add header/footer (logo, page numbers)
   - Add charts jika ada
9. System return PDF file
10. Frontend trigger download
11. Audit log: Report generated

**Diagram** (Phase 2):



---

## 7. Flow Notifikasi

### 7.1 Flow In-App Notification (Phase 1: Basic, Phase 2: Full)

**Langkah Receive Notification** (Phase 1 - Basic):

1. System event terjadi (user created, data updated, dll)
2. System create notification record:
   - user_id (recipient)
   - type (info, success, warning, error)
   - title
   - message
   - link (optional, untuk navigate)
   - read_at (NULL untuk unread)
3. System increment unread counter di Redis
4. Frontend polling unread count setiap 30 detik (Phase 1)
5. Frontend update bell icon badge jika ada notif baru

**Langkah View Notifications** (Phase 1):

1. User klik bell icon di header
2. Frontend fetch notifications (latest 10)
3. System return list notifications (read dan unread)
4. Frontend show dropdown dengan list notifications
5. User melihat notifications:
   - Title dan message
   - Timestamp (relative: 5 menit lalu)
   - Read/unread indicator (dot biru)
6. User bisa:
   - Klik notification untuk navigate ke link
   - Klik Mark as Read
   - Klik Mark All as Read

**Langkah Mark as Read** (Phase 1):

1. User klik notification
2. System update read_at = now
3. System decrement unread counter
4. Frontend remove unread indicator
5. Frontend navigate ke link (jika ada)

**Diagram**:



---

### 7.2 Flow Email Notification (Phase 2)

**Langkah** (Phase 2):

1. System event terjadi (password reset, welcome, dll)
2. System check user email preferences (enabled?)
3. System load email template (Handlebars)
4. System render template dengan variables
5. System queue email job (Bull queue)
6. Background worker process email:
   - Connect ke SMTP server
   - Send email
   - Update delivery status
7. System log email sent
8. Jika failed: Retry dengan backoff strategy

---

## 8. Flow Error dan Penolakan

### 8.1 Flow Validation Error

**Tujuan**: Menangani error validasi input

**Langkah**:

1. User submit form (create atau update)
2. System validasi input:
   - Required fields empty
   - Format invalid (email, phone)
   - Length invalid (min/max)
   - Value invalid (negative number)
3. System return error response:
   
4. Frontend parse error response
5. Frontend show errors:
   - Per-field error di bawah input (text merah)
   - Error toast di atas form (summary)
   - Focus ke field pertama yang error
6. Form tetap terisi dengan input user
7. User fix errors
8. System validasi real-time saat user mengetik
9. Error message hilang saat field valid
10. User submit lagi

**Diagram**:



---

### 8.2 Flow Permission Denied Error (403)

**Tujuan**: Menangani akses tanpa permission

**Langkah**:

1. User coba akses resource atau action
2. System check permission (CASL):
   - User role
   - Resource
   - Action (create, read, update, delete)
   - Scope (own, tenant, all)
3. System detect: User tidak punya permission
4. System return 403 Forbidden:
   
5. Frontend show error:
   - Error modal atau toast
   - Message jelas dalam Bahasa Indonesia
   - Button: OK atau Kembali
6. Frontend redirect ke previous page atau dashboard
7. Audit log: Permission denied attempt

---

### 8.3 Flow Not Found Error (404)

**Langkah**:

1. User akses URL dengan ID yang tidak exists
2. System query database by ID
3. System detect: Data not found atau sudah deleted
4. System return 404 Not Found:
   
5. Frontend redirect ke 404 page:
   - Icon atau illustration
   - Message: Data tidak ditemukan
   - Suggestions: Kembali ke list atau dashboard
   - Button: Kembali
6. User klik Kembali
7. Frontend navigate ke list page

---

### 8.4 Flow Server Error (500)

**Langkah**:

1. User submit request
2. Backend processing error (exception):
   - Database error
   - Third-party API error
   - Unexpected error
3. System catch exception di global error handler
4. System log error dengan stack trace
5. System return 500 Internal Server Error:
   
6. Frontend show error:
   - Error page atau modal
   - Message: Terjadi kesalahan sistem
   - Request ID untuk dilaporkan
   - Button: Coba Lagi atau Kembali
7. Frontend log error ke monitoring (Sentry, dll di Phase 2)
8. User bisa coba lagi atau kembali

---

### 8.5 Flow Rate Limit Error (429)

**Langkah**:

1. User submit multiple requests cepat (spam)
2. System check rate limit:
   - Per tenant: 1000 requests per minute
   - Per endpoint: 60 requests per minute
   - Per user: 100 requests per minute
3. System detect: Exceeded rate limit
4. System return 429 Too Many Requests:
   
5. Frontend show error toast:
   - Message: Terlalu banyak permintaan
   - Retry in: 60 detik
6. Frontend disable submit button selama retry period
7. Frontend auto-retry setelah retry period (optional)

---

### 8.6 Flow Conflict Error (409)

**Tujuan**: Menangani concurrent edit (optimistic locking)

**Langkah**:

1. User A dan User B buka edit form untuk data yang sama
2. User A modify dan save (updated_at = T1)
3. User B modify dan save (dengan updated_at = T0)
4. System detect conflict:
   - updated_at di request (T0) tidak match dengan DB (T1)
   - Data sudah diupdate oleh user lain
5. System return 409 Conflict:
   
6. Frontend show error modal:
   - Message: Data sudah diupdate oleh user lain
   - Options: Reload data dan lihat changes atau Timpa changes
   - Buttons: Reload, Timpa, Batal
7. User pilih Reload
8. Frontend fetch latest data
9. Frontend populate form dengan data terbaru
10. User re-apply changes dan save

**Diagram**:



---

## 9. Flow Logout

### 9.1 Flow Logout Normal

**Tujuan**: User logout dari sistem

**Langkah**:

1. User sudah login dan di aplikasi
2. User klik user menu di header (avatar atau name)
3. System show dropdown menu:
   - Profile
   - Settings
   - Logout
4. User klik Logout
5. System show confirmation (optional): Yakin ingin keluar?
6. User confirm
7. Frontend kirim logout request ke backend
8. Backend:
   - Extract token dari cookie
   - Invalidate token (add to blacklist di Redis)
   - Delete session dari Redis
   - Set session expired_at = now
9. Backend return success
10. Frontend:
    - Clear token dari cookie
    - Clear user data dari state (Zustand)
    - Clear local storage jika ada
11. Frontend redirect ke login page
12. Audit log: User logged out

**Diagram**:



---

### 9.2 Flow Auto Logout (Inactivity)

**Tujuan**: Auto logout setelah user inactive

**Langkah**:

1. User login dan aktif di aplikasi
2. Frontend track user activity:
   - Mouse movement
   - Keyboard input
   - Click events
3. Frontend set inactivity timer (default: 30 menit)
4. User inactive selama 30 menit (no activity)
5. Frontend show warning modal:
   - Message: Sesi Anda akan berakhir dalam 2 menit
   - Button: Perpanjang Sesi
   - Countdown timer
6. Jika user klik Perpanjang:
   - Reset inactivity timer
   - Refresh JWT token (jika needed)
   - Close modal
7. Jika user tidak action (timeout):
   - Auto logout (sama seperti logout normal)
   - Show message: Sesi berakhir karena tidak aktif
   - Redirect ke login
8. Audit log: Auto logged out (inactivity)

**Diagram**:



---

### 9.3 Flow Force Logout (Admin Action)

**Tujuan**: Admin force logout user (deactivate, role change, dll)

**Langkah**:

1. Admin deactivate user atau change role
2. System invalidate semua sessions untuk user tersebut:
   - Delete sessions dari Redis
   - Add tokens to blacklist
3. System emit event ke user (WebSocket di Phase 2, polling di Phase 1)
4. Frontend detect session invalid (saat next API call):
   - API return 401 Unauthorized
   - Error: Session invalid
5. Frontend auto logout:
   - Clear state
   - Show message: Akun Anda dinonaktifkan
   - Redirect ke login
6. User tidak bisa login lagi (jika deactivated)
7. Audit log: Force logged out

---

### 9.4 Flow Logout All Devices

**Tujuan**: User logout dari semua devices

**Langkah**:

1. User di Settings atau Profile page
2. User melihat Active Sessions list:
   - Device info (browser, OS)
   - Location (IP, city)
   - Last activity
   - Current session indicator
3. User klik Logout dari Semua Perangkat
4. System show confirmation: Logout dari X perangkat?
5. User confirm
6. System:
   - Delete ALL sessions untuk user (except current)
   - Invalidate ALL tokens
7. System return success
8. Frontend show success: Berhasil logout dari semua perangkat
9. Other devices: Auto logout saat next request (401)
10. Audit log: Logged out from all devices

**Diagram**:



---

## Summary Flow Diagram

### Complete User Journey



---

## Key Principles

### 1. User-Centric Design
- Semua flow dimulai dari perspektif user
- Error messages jelas dalam Bahasa Indonesia
- Feedback immediate (loading, success, error)

### 2. Security First
- Permission check di setiap action
- Input validation dan sanitization
- Audit logging semua critical operations
- Session management dengan timeout

### 3. Tenant Isolation
- Semua data operations tenant-aware
- Cross-tenant data leakage prevention
- Automatic schema switching

### 4. Error Handling
- Per-field validation errors
- Clear error messages
- Recovery suggestions
- Audit trail untuk errors

### 5. Soft Delete Pattern
- No permanent data deletion
- Restore functionality available
- Audit trail preserved

---

## Flow Coverage

| Flow | MVP Phase 1 | Phase 2 | Phase 3 |
|------|-------------|---------|----------|
| Login | ✅ Full | - | - |
| Dashboard | ✅ Full | Enhancements | - |
| CRUD Operations | ✅ Full | - | - |
| Admin/Operator | ✅ Basic | Full | - |
| Approval | ❌ Not included | ✅ Full | - |
| Generate Dokumen | ❌ Not included | ✅ Full | - |
| Notification | ✅ Basic (polling) | ✅ Full (WebSocket) | - |
| Error Handling | ✅ Full | Enhancements | - |
| Logout | ✅ Full | - | - |

---

## Implementation Notes

### Frontend
- Use React Hook Form untuk form management
- Use Zod untuk validation schemas
- Use TanStack Query untuk server state
- Use Zustand untuk global state
- Loading states di semua async operations
- Error boundaries untuk catch unexpected errors

### Backend
- Use NestJS Guards untuk authentication
- Use CASL untuk authorization
- Use Pipes untuk validation
- Use Interceptors untuk response formatting
- Use Exception Filters untuk error handling
- Audit logging di service layer

### Database
- Soft delete mandatory untuk semua entities
- Audit columns: created_by, updated_by, deleted_by, timestamps
- Tenant isolation via schema-based multi-tenancy
- Optimistic locking untuk prevent concurrent updates

---

**Status**: ✅ Complete - Ready for Implementation  
**Next Document**: SCREEN-LIST.md atau DATABASE-DESIGN.md  
**Dependencies**: PRD approved ✅, FEATURE-LIST approved ✅  

---

*Dokumen ini menjelaskan user flows untuk Platform CMS MVP. Setiap flow menggambarkan langkah-langkah user dari awal sampai akhir dengan handling success dan error cases.*
