# SCREEN LIST
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Screen List Specification  
**Reference**: PROJECT-BRIEF.md, PRD.md, FEATURE-LIST.md, USER-FLOW.md

---

## Pendahuluan

Dokumen ini berisi daftar lengkap screens (halaman) yang akan dikembangkan dalam Platform CMS MVP. Setiap screen mencakup role akses, fungsi, data yang ditampilkan, dan aksi utama.

### Notasi

- **Public** - Dapat diakses tanpa login
- **Authenticated** - Membutuhkan login
- **Super Admin** - Role Super Admin only
- **Tenant Admin** - Role Tenant Admin only
- **User** - Regular user dengan permissions
- **All Roles** - Semua role yang sudah login

### State Management per Screen

Setiap screen harus handle 4 states:
1. **Loading** - Fetching data, show skeleton/spinner
2. **Empty** - No data, show empty state dengan illustration
3. **Error** - Failed to load, show error message dengan retry button
4. **Success** - Data loaded, show normal UI

---

## Ringkasan Screen

| Kategori | Jumlah Screen | Prioritas |
|----------|---------------|-----------|
| Halaman Publik | 8 | P0-P2 |
| Halaman Dashboard | 3 | P0 |
| Halaman Authentication | 2 | P0 |
| Halaman User Management | 5 | P0 |
| Halaman Role & Permission | 4 | P0 |
| Halaman Tenant Management | 5 | P0 |
| Halaman Master Data | 4 | P1 |
| Halaman Audit Log | 2 | P1 |
| Halaman Settings | 4 | P1 |
| Halaman Module Management | 3 | P1 |
| Halaman Profile | 2 | P0 |
| Modal/Dialog | 10 | P0-P1 |
| Component Reusable | 15 | P0 |

**Total Screens**: 67 screens/components  
**MVP (Phase 1)**: 62 screens  
**Phase 2+**: 5 screens

---

## 1. Daftar Halaman Publik

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| Landing Page | Public | Homepage aplikasi (optional) | Tagline, Features, CTA | Navigate ke Login | P2 |
| Login Page | Public | User login | Form (email, password), Remember me, Link reset password | Login, Forgot Password | P0 |
| Register Page | Public | User registration (jika enabled) | Form (email, password, name) | Register | P1 |
| Forgot Password | Public | Request password reset | Form (email), Instructions | Send Reset Link | P1 |
| Reset Password | Public | Set new password via token | Form (new password, confirm password) | Submit New Password | P1 |
| 404 Not Found | Public/All | Page not found | Illustration, Error message | Back to Home/Dashboard | P0 |
| 403 Forbidden | Authenticated | Permission denied | Illustration, Error message | Back to Dashboard | P0 |
| 500 Server Error | Public/All | Server error | Illustration, Error message, Request ID | Reload, Contact Support | P0 |

**States per Screen**:
- **Login**: Normal, Loading (submitting), Error (invalid credentials, account inactive, rate limit)
- **Register**: Normal, Loading, Error (email exists, validation failed)
- **Forgot Password**: Normal, Loading, Success (email sent), Error (email not found)
- **Reset Password**: Normal, Loading, Success (password changed), Error (invalid/expired token)
- **Error Pages**: Static (no loading/empty states)

---

## 2. Daftar Halaman Dashboard

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| Dashboard Super Admin | Super Admin | Overview seluruh platform | Stats: Total tenants (active/inactive), Total users (all tenants), New tenants (month), New users (month), System health (API time, DB time, memory), Recent activities (all tenants), Quick actions | Create Tenant, View All Tenants, View All Users, System Settings | P0 |
| Dashboard Tenant Admin | Tenant Admin | Overview tenant | Stats: Total users (tenant), Active users, New users (month), Storage usage, Recent activities (tenant), Quick actions | Create User, Manage Users, Manage Roles, Tenant Settings | P0 |
| Dashboard User | User | Overview personal | Profile summary, Assigned roles, Recent activities (own), Quick links (allowed modules) | View Profile, Navigate to Modules | P0 |

**States per Dashboard**:
- **Loading**: Skeleton untuk semua widgets
- **Empty**: Widget tertentu show "Belum ada data"
- **Error**: Per-widget error dengan retry button
- **Success**: Display all widgets dengan chart dan statistics

---


## 3. Daftar Halaman per Role

### 3.1 Halaman Super Admin Only

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| Tenant List | Super Admin | Manage tenants | Table: name, slug, domain, subscription tier, status, user count, created_at, actions | Create, View, Edit, Delete, Restore, Activate/Deactivate | P0 |
| Tenant Create | Super Admin | Create new tenant | Form: name, domain (optional), subscription tier, expires_at | Save, Cancel | P0 |
| Tenant Edit | Super Admin | Edit tenant | Form: name, domain, subscription tier, config (JSONB) | Save, Cancel | P0 |
| Tenant Detail | Super Admin | View tenant detail | Info: name, slug, domain, schema_name, statistics, users, subscription | Edit, Delete, View Users | P0 |
| System Settings | Super Admin | System configuration | Form: site name, logo, default language, timezone, maintenance mode | Save | P1 |
| Module List | Super Admin | Manage modules | Table: name, display_name, route_prefix, version, is_core, tenant_count, actions | View, Edit, Activate/Deactivate | P1 |
| Module Detail | Super Admin | View module detail | Info: name, display_name, description, icon, route_prefix, permissions, tenant usage stats | Edit, View Tenants Using Module | P1 |

### 3.2 Halaman Tenant Admin

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| User List | Tenant Admin, Super Admin | Manage users | Table: name, email, roles, status, last_login, actions | Create, View, Edit, Delete, Restore, Activate/Deactivate | P0 |
| User Create | Tenant Admin, Super Admin | Create user | Form: email, name, phone, password (auto/manual), roles | Save, Cancel | P0 |
| User Edit | Tenant Admin, Super Admin | Edit user | Form: name, phone, avatar, roles | Save, Cancel | P0 |
| User Detail | Tenant Admin, Super Admin | View user detail | Info: profile, roles, permissions, activity history, sessions | Edit, Delete, Manage Roles, Deactivate | P0 |
| Role List | Tenant Admin, Super Admin | Manage roles | Table: name, description, user count, system role flag, actions | Create, View, Edit, Delete | P0 |
| Role Create | Tenant Admin, Super Admin | Create custom role | Form: name, description, permissions (multi-select) | Save, Cancel | P0 |
| Role Edit | Tenant Admin, Super Admin | Edit role | Form: name, description, permissions | Save, Cancel | P0 |
| Role Detail | Tenant Admin, Super Admin | View role detail | Info: name, description, assigned permissions, assigned users | Edit, Delete, Manage Permissions | P0 |
| Tenant Settings | Tenant Admin | Tenant configuration | Form: branding (logo, colors), features toggles, limits | Save | P1 |
| Tenant Module Settings | Tenant Admin | Enable/disable modules | List: available modules (based on subscription tier), toggle switches, module descriptions | Enable/Disable Module, Configure Module | P1 |

### 3.3 Halaman User (All Authenticated)

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| My Profile | All Roles | View own profile | Info: email, name, phone, avatar, roles, joined date | Edit Profile, Change Password | P0 |
| Edit Profile | All Roles | Edit own profile | Form: name, phone, avatar | Save, Cancel | P0 |
| Change Password | All Roles | Change password | Form: old password, new password, confirm password | Save, Cancel | P0 |

---

## 4. Daftar Halaman CRUD (Generic Pattern)

### 4.1 User Management Module

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| User List | Tenant Admin, Super Admin | List users dengan filter | Table: name, email, roles, status, last_login. Filter: role, status. Sort: name, email, created_at. Search: name, email. Pagination. | Create User, View, Edit, Delete, Restore, Export | P0 |
| User Create | Tenant Admin, Super Admin | Create new user | Form: email, full_name, phone, password (generate/manual), roles (multi-select). Validation real-time. | Save, Save & Add Another, Cancel | P0 |
| User Detail | Tenant Admin, Super Admin | View user detail | Section: Profile info, Assigned roles, Permissions, Activity log, Active sessions. Tabs: Info, Roles, Activity, Sessions. | Edit, Delete, Manage Roles, Deactivate, Logout All Devices | P0 |
| User Edit | Tenant Admin, Super Admin | Edit user | Form: full_name, phone, avatar upload. Email immutable. Validation real-time. | Save, Cancel | P0 |
| User Restore | Tenant Admin, Super Admin | View deleted users | Table: same as list + deleted_at, deleted_by. Filter: show deleted only. | Restore, Permanent Delete (Super Admin only) | P1 |

**States**:
- **List**: Loading (skeleton table), Empty (no users yet), Error (failed to load), Success (data table)
- **Create/Edit**: Normal, Loading (submitting), Success (saved), Error (validation/server error)
- **Detail**: Loading (skeleton), Error (not found/forbidden), Success (full data)

---

### 4.2 Tenant Management Module

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| Tenant List | Super Admin | List tenants | Table: name, slug, domain, tier, status, user count, created_at. Filter: status, tier. Sort: name, created_at. Search: name, domain. | Create Tenant, View, Edit, Delete, Restore | P0 |
| Tenant Create | Super Admin | Create tenant | Form: name (auto-generate slug), domain (optional), subscription_tier (dropdown), subscription_expires_at (datepicker). | Save, Cancel | P0 |
| Tenant Detail | Super Admin | View tenant detail | Sections: Basic info, Statistics (users, storage), Subscription, Schema info (schema_name, created_at), Admin user. Tabs: Info, Users, Activity. | Edit, Delete, Activate/Deactivate | P0 |
| Tenant Edit | Super Admin | Edit tenant | Form: name, domain, subscription_tier, subscription_expires_at, config (JSON editor). Slug immutable. | Save, Cancel | P0 |
| Tenant Restore | Super Admin | View deleted tenants | Table: same as list + deleted_at, deleted_by. | Restore | P1 |

---

### 4.3 Role & Permission Module

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| Role List | Tenant Admin, Super Admin | List roles | Table: name, description, user count, system role flag. Filter: system/custom. Sort: name. Search: name. | Create Role, View, Edit, Delete | P0 |
| Role Create | Tenant Admin, Super Admin | Create custom role | Form: name, description. Permission list (grouped by resource): checkboxes for create, read, update, delete per resource. | Save, Cancel | P0 |
| Role Detail | Tenant Admin, Super Admin | View role detail | Info: name, description, system role flag. Tables: Assigned permissions (resource, actions, scope), Assigned users. | Edit, Delete, Manage Permissions, Assign Users | P0 |
| Role Edit | Tenant Admin, Super Admin | Edit role | Form: name (immutable for system roles), description, permissions. | Save, Cancel | P0 |

---

### 4.4 Master Data Module

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| Category List | User (with permission) | Manage categories | Table: name, slug, parent, item count. Tree view (hierarchy). Search: name. | Create, View, Edit, Delete, Reorder | P1 |
| Category Form | User (with permission) | Create/Edit category | Form: name (auto-generate slug), parent (dropdown tree), description. | Save, Cancel | P1 |
| Tag List | User (with permission) | Manage tags | Table: name, slug, color, usage count. Search: name. | Create, Edit, Delete, Merge Tags | P1 |
| Tag Form | User (with permission) | Create/Edit tag | Form: name (auto-generate slug), color picker. | Save, Cancel | P1 |

---

## 5. Daftar Halaman Detail (View Mode)

| Screen | Role Akses | Fungsi | Data yang Ditampilkan | Aksi Utama | Prioritas |
|--------|------------|--------|----------------------|------------|-----------|
| Audit Log Detail | Super Admin, Tenant Admin | View audit log entry | Info: user, tenant, action, resource, resource_id, changes (before/after JSON diff), IP address, user_agent, timestamp | Back to List, Export | P1 |
| Session Detail | User (own), Admin | View session detail | Info: session_id, device (browser, OS), location (IP, city), last_activity, created_at | Logout Session | P1 |
| Notification Detail | User | View notification detail | Info: title, message, type, read status, link, created_at | Mark as Read, Navigate to Link | P2 |

---


## 6. Daftar Modal/Dialog Penting

| Modal/Dialog | Trigger | Fungsi | Konten | Actions | Prioritas |
|--------------|---------|--------|--------|---------|-----------|
| Confirmation Delete | Click Delete button | Confirm soft delete | Title: Hapus Data?, Message: Data akan disembunyikan tapi bisa di-restore, Icon: Warning | Ya Hapus, Batal | P0 |
| Confirmation Permanent Delete | Click Permanent Delete (Super Admin) | Confirm hard delete | Title: Hapus Permanent?, Message: Data akan dihapus permanent dan tidak bisa di-restore!, Icon: Danger | Ya Hapus Permanent, Batal | P1 |
| Confirmation Restore | Click Restore button | Confirm restore deleted data | Title: Restore Data?, Message: Data akan dikembalikan ke daftar aktif | Ya Restore, Batal | P1 |
| Manage Roles Modal | Click Manage Roles on user | Assign/remove roles | User info, Checkbox list of available roles, Current roles highlighted | Save, Cancel | P0 |
| Manage Permissions Modal | Click Manage Permissions on role | Assign/remove permissions | Role info, Grouped checkboxes (by resource), Permission matrix (resource × actions) | Save, Cancel | P0 |
| Change Password Modal | Click Change Password | User change own password | Form: old password, new password, confirm password, Password strength indicator | Save, Cancel | P0 |
| Session Timeout Warning | Auto after 28 min inactive | Warn user before auto logout | Message: Sesi akan berakhir dalam 2 menit, Countdown timer | Perpanjang Sesi, Logout Sekarang | P1 |
| Upload Avatar Modal | Click Upload Avatar | Crop and upload profile picture | Image uploader, Crop tool, Preview | Upload, Cancel | P1 |
| Export Data Modal | Click Export button | Choose export format | Radio buttons: CSV, Excel, PDF, Filter options (date range, columns) | Export, Cancel | P2 |
| View Changes Modal | Click View Changes in audit log | Show before/after data | JSON diff viewer, Highlighted changes, Before/After side-by-side | Close | P1 |

**Modal States**:
- **Normal**: Show content
- **Loading**: Show spinner dalam modal (saat submit)
- **Success**: Auto-close atau show success message
- **Error**: Show error message di dalam modal, modal tetap open

---

## 7. Komponen UI Reusable

### 7.1 Layout Components

| Component | Fungsi | Props | Prioritas |
|-----------|--------|-------|-----------|
| AppLayout | Main layout dengan header, sidebar, content | children, user, onLogout | P0 |
| AuthLayout | Layout untuk login, register pages | children, title | P0 |
| Header | Top bar dengan logo, search, notifications, user menu | user, notificationCount, onLogout | P0 |
| Sidebar | Navigation menu dengan collapsible | menuItems, activeItem, collapsed, onToggle | P0 |
| Breadcrumbs | Navigation breadcrumb | items (label, href) | P1 |
| PageHeader | Header setiap page dengan title dan actions | title, description, actions (buttons) | P0 |

### 7.2 Form Components

| Component | Fungsi | Props | Prioritas |
|-----------|--------|-------|-----------|
| Input | Text input dengan validation | name, label, placeholder, type, error, required | P0 |
| Select | Dropdown select | name, label, options, value, onChange, error, multi | P0 |
| Textarea | Multi-line text input | name, label, placeholder, rows, error | P0 |
| Checkbox | Single checkbox | name, label, checked, onChange | P0 |
| Radio | Radio button group | name, label, options, value, onChange | P0 |
| DatePicker | Date picker | name, label, value, onChange, minDate, maxDate | P0 |
| FileUpload | File upload dengan preview | name, label, accept, maxSize, onUpload, error | P1 |
| PasswordInput | Password input dengan show/hide toggle | name, label, showStrength, error | P0 |
| FormGroup | Wrapper untuk form field dengan label dan error | label, error, required, children | P0 |

### 7.3 Data Display Components

| Component | Fungsi | Props | Prioritas |
|-----------|--------|-------|-----------|
| DataTable | Table dengan sort, filter, pagination | columns, data, onSort, onFilter, onPageChange, loading, empty | P0 |
| Card | Card container | title, actions, children | P0 |
| Badge | Status badge | label, variant (success, warning, error, info) | P0 |
| Avatar | User avatar dengan fallback | src, name (for initials), size | P0 |
| EmptyState | Empty state dengan illustration | title, description, action (button), icon | P0 |
| ErrorState | Error state dengan retry | title, description, onRetry, icon | P0 |
| Skeleton | Loading skeleton | variant (text, card, table), count | P0 |
| Pagination | Pagination controls | currentPage, totalPages, onPageChange | P0 |

### 7.4 Feedback Components

| Component | Fungsi | Props | Prioritas |
|-----------|--------|-------|-----------|
| Button | Button dengan variants | label, variant (primary, secondary, ghost, destructive), size, loading, disabled, onClick | P0 |
| Toast | Toast notification | message, type (success, error, warning, info), duration, onClose | P0 |
| Modal | Modal dialog | title, children, onClose, size, actions (footer buttons) | P0 |
| Alert | Inline alert | title, message, type (success, error, warning, info), dismissible | P0 |
| Spinner | Loading spinner | size, color | P0 |
| ProgressBar | Progress indicator | value, max, label | P1 |
| Tooltip | Tooltip on hover | content, children | P1 |

### 7.5 Navigation Components

| Component | Fungsi | Props | Prioritas |
|-----------|--------|-------|-----------|
| Tabs | Tab navigation | tabs (label, content), activeTab, onChange | P0 |
| Dropdown | Dropdown menu | trigger, items (label, onClick, icon), position | P0 |
| NotificationBell | Notification icon dengan badge | count, notifications, onMarkAsRead | P1 |
| UserMenu | User dropdown menu | user, onProfile, onSettings, onLogout | P0 |

---

## 8. State yang Dibutuhkan Setiap Screen

### 8.1 State Pattern untuk List Pages

**States**:
1. **Initial Loading**
   - UI: Skeleton table (5-10 rows)
   - When: First load, no cached data

2. **Empty State**
   - UI: Illustration + "Belum ada data" + "Tambah Data" button
   - When: Query success tapi data kosong

3. **Error State**
   - UI: Error icon + Error message + "Coba Lagi" button
   - When: Fetch failed (network, server error)
   - Actions: Retry fetch

4. **Success State dengan Data**
   - UI: Data table dengan rows
   - Includes: Pagination, filters, search, actions

5. **Refetching State** (Background refresh)
   - UI: Small loading indicator di header (tidak block UI)
   - When: Auto-refresh atau manual refresh

6. **Deleting/Updating State**
   - UI: Loading overlay pada row yang diproses
   - When: Delete, update, restore action

### 8.2 State Pattern untuk Form Pages (Create/Edit)

**States**:
1. **Initial Loading** (Edit mode only)
   - UI: Skeleton form fields
   - When: Fetching existing data

2. **Normal/Idle State**
   - UI: Kosong (create) atau populated (edit)
   - Validation: Real-time per field

3. **Validating State**
   - UI: Loading indicator per field
   - When: Async validation (check unique email, dll)

4. **Submitting State**
   - UI: Disabled form + Loading button
   - When: Submitting form

5. **Success State**
   - UI: Success toast + Redirect ke list atau detail
   - When: Save success

6. **Error State**
   - UI: Error toast + Per-field errors (inline)
   - When: Validation failed atau server error
   - Actions: Fix errors dan submit lagi

### 8.3 State Pattern untuk Detail Pages

**States**:
1. **Loading**
   - UI: Skeleton sections
   - When: Fetching detail data

2. **Not Found (404)**
   - UI: 404 illustration + "Data tidak ditemukan"
   - When: ID tidak exists atau sudah deleted
   - Actions: Back to list

3. **Forbidden (403)**
   - UI: 403 illustration + "Tidak punya akses"
   - When: No permission untuk view
   - Actions: Back to dashboard

4. **Success**
   - UI: Display full data dengan sections/tabs
   - Includes: Action buttons (Edit, Delete, dll)

### 8.4 State Pattern untuk Dashboard

**States**:
1. **Loading**
   - UI: Skeleton untuk semua widgets
   - When: Initial load

2. **Partial Loading**
   - UI: Some widgets loaded, some still loading
   - When: Widgets load independently

3. **Partial Error**
   - UI: Some widgets show data, some show error
   - When: Some API calls failed
   - Actions: Retry per widget

4. **Success**
   - UI: All widgets dengan data/charts

---

## 9. Prioritas Pembuatan Screen untuk MVP

### Week 1-2: Setup & Authentication (P0)

| Week | Screen | Reason |
|------|--------|--------|
| 1 | AppLayout, AuthLayout | Foundation untuk semua pages |
| 1 | Login Page | Entry point, blocking |
| 1 | 404, 403, 500 Pages | Error handling basics |
| 2 | Dashboard (basic) | Post-login destination |
| 2 | My Profile, Edit Profile | Basic user management |

### Week 3-5: Core Features (P0)

| Week | Screen | Reason |
|------|--------|--------|
| 3 | Tenant List, Create, Detail | Multi-tenancy core (Super Admin) |
| 3 | Tenant Edit | Complete CRUD |
| 4 | User List, Create, Detail, Edit | User management core |
| 4 | Manage Roles Modal | Role assignment |
| 5 | Role List, Create, Detail, Edit | RBAC implementation |
| 5 | Manage Permissions Modal | Permission management |

### Week 6-8: Extended Features (P0-P1)

| Week | Screen | Reason |
|------|--------|--------|
| 6 | Change Password Modal, Page | Security |
| 6 | User Restore, Tenant Restore | Soft delete management |
| 7 | Forgot Password, Reset Password | Password recovery |
| 7 | Register Page (optional) | User registration |
| 8 | Audit Log List, Detail | Compliance |

### Week 9-11: Master Data & Settings (P1)

| Week | Screen | Reason |
|------|--------|--------|
| 9 | Category List, Form | Master data |
| 9 | Tag List, Form | Tagging system |
| 10 | System Settings | System configuration |
| 10 | Tenant Settings | Tenant customization |
| 11 | All reusable components refinement | Polish UI |

### Week 12-14: CLI & Components (P1)

| Week | Screen | Reason |
|------|--------|--------|
| 12-14 | CLI Builder (backend focus) | Code generation |
| 12-14 | Component library polish | UI consistency |

### Week 15: Dashboard Enhancement (P1)

| Week | Screen | Reason |
|------|--------|--------|
| 15 | Dashboard widgets enhancement | Better UX |
| 15 | Notification Bell component | User feedback |
| 15 | Session management UI | Security features |

### Week 16: Polish & Documentation (P1-P2)

| Week | Screen | Reason |
|------|--------|--------|
| 16 | Landing Page (optional) | Public face |
| 16 | All screens polish | Final touches |
| 16 | Responsive testing | Mobile-friendly |

---

## Summary

### Screen Counts by Priority

| Priority | Screens | Status |
|----------|---------|--------|
| P0 (Critical) | 42 screens | Must have untuk MVP |
| P1 (High) | 17 screens | Should have untuk MVP |
| P2 (Medium) | 5 screens | Could have / Phase 2 |

**Total MVP Screens**: 59 screens  
**Phase 2 Screens**: 5 screens

### Component Reusability

**Reusable Components**: 28 components  
- Layout: 6 components
- Form: 9 components  
- Data Display: 8 components
- Feedback: 7 components
- Navigation: 4 components

**Benefit**: Dengan 28 reusable components, 64 screens dapat dibangun dengan consistent UI dan faster development.

---

## Implementation Guidelines

### 1. Component-First Approach
- Build reusable components first (Week 1-2)
- Use shadcn/ui sebagai base
- Customize sesuai design system

### 2. State Management
- Use Zustand untuk global state (auth, user, tenant)
- Use TanStack Query untuk server state (API calls)
- Use React Hook Form + Zod untuk form state

### 3. Route Structure
```
/login
/register
/forgot-password
/reset-password/:token
/dashboard
/users (list)
/users/create
/users/:id (detail)
/users/:id/edit
/users/deleted (restore)
/tenants (Super Admin only)
/tenants/create
/tenants/:id
/tenants/:id/edit
/roles
/roles/create
/roles/:id
/roles/:id/edit
/profile
/profile/edit
/settings
/audit-logs
/categories
/tags
```

### 4. Permission Guards
- Every route harus check permissions
- Redirect ke 403 jika tidak punya akses
- Hide menu items yang tidak bisa diakses

### 5. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar di mobile
- Responsive tables (stack cards di mobile)

---

**Status**: ✅ Complete - Ready for UI Implementation  
**Next Document**: TECHNICAL-ARCHITECTURE.md atau DATABASE-DESIGN.md  
**Dependencies**: PRD approved ✅, FEATURE-LIST approved ✅, USER-FLOW approved ✅  

---

*Dokumen ini adalah screen list lengkap untuk Platform CMS MVP. Setiap screen didefinisikan dengan jelas untuk memudahkan implementasi frontend.*
