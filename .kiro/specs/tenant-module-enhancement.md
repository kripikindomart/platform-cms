# Tenant Module Enhancement - Master Plan

**Created**: 2026-07-19
**Status**: Planning
**Priority**: P1 - HIGH
**Module**: Tenant Management

---

## Overview

Dokumen ini merupakan master plan lengkap untuk pengembangan Module Tenant Management. Semua fitur yang akan dikerjakan terdokumentasi di sini sebagai referensi jika context habis.

---

## Current Status

### Completed Features
- [x] List tenants dengan search & pagination
- [x] Tenant detail page dengan 4 tabs (Overview, Users, Modules, Settings)
- [x] Soft delete & trash functionality  
- [x] Bulk actions (activate, deactivate, delete, restore)
- [x] User management dalam tenant dengan search, pagination, bulk actions
- [x] Optimistic UI updates dengan rollback
- [x] Switch toggle untuk status
- [x] Stats/statistics cards
- [x] Rows per page selector di semua tabel

### Pending Features (Prioritized)

#### URGENT (P0) - Must Have
1. **Rows Per Page Selector di Tenant List Page** - Quick win untuk konsistensi
2. **Create Tenant Form** - Tanpa ini user tidak bisa create tenant baru
3. **Edit Tenant Form** - Edit button sudah ada tapi tidak ada formnya

#### HIGH (P1) - Important
4. **Settings Tab Implementation** - Minimal basic settings
5. **Add Users to Tenant** - Sekarang hanya bisa remove, perlu bisa add juga
6. **Modules Management** - Enable/disable modules per tenant

#### MEDIUM (P2) - Enhancement
7. **Roles Management** - Create/assign roles dalam tenant
8. **Activity Logs** - Timeline activity untuk audit

#### LOW (P3) - Nice to Have
9. **Analytics Dashboard** - Charts & metrics
10. **Bulk Import/Export** - Import/export tenants

---

## Task Breakdown

### TASK 7.1: Rows Per Page Selector - Tenant List Page

**Priority**: P0 - URGENT (Quick Win)
**Estimated Time**: 0.5 hours
**Dependencies**: None

**Objective**:
Menambahkan Rows Per Page Selector di halaman list tenant untuk konsistensi dengan halaman lain.

**Deliverables**:
- [ ] Import Select component di `tenants/page.tsx`
- [ ] Ubah `limit` dari readonly ke state
- [ ] Tambahkan selector di pagination section
- [ ] Test perubahan limit (10, 25, 50, 100)

**Files to Modify**:
1. `frontend/app/(private)/org/[tenant]/portal/tenants/page.tsx`
   - Import Select components
   - Change: `const [limit] = useState(10)` to `const [limit, setLimit] = useState(10)`
   - Add selector UI in pagination section

**Acceptance Criteria**:
- [ ] Selector muncul di kiri bawah tabel
- [ ] Options: 10, 25, 50, 100
- [ ] Auto reset to page 1 saat limit berubah
- [ ] Styling konsisten dengan tenant detail page

---

### TASK 7.2: Create Tenant Form

**Priority**: P0 - URGENT
**Estimated Time**: 4 hours
**Dependencies**: None

**Objective**:
Membuat halaman form untuk create tenant baru dengan validasi lengkap.

**Deliverables**:

#### 1. Create Form Page
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/create/page.tsx`

**Fields**:
- [ ] Name (required, max 255 chars)
- [ ] Slug (required, auto-generate from name, lowercase, hyphenated)
- [ ] Description (optional, textarea, max 500 chars)
- [ ] Is Active (checkbox, default true)
- [ ] Logo Upload (optional, image file)
- [ ] Primary Color (color picker, optional)
- [ ] Secondary Color (color picker, optional)

**Validations**:
- [ ] Name: required, min 3 chars, max 255 chars
- [ ] Slug: required, lowercase, no spaces, unique check
- [ ] Description: max 500 chars
- [ ] Logo: max 2MB, only jpg/png
- [ ] Colors: valid hex color format

#### 2. Backend API Endpoint
**File**: `backend/src/modules/tenants/tenants.controller.ts`

**Endpoint**: `POST /api/tenants`

**Add to controller**:
```typescript
@Post()
@Permissions('tenants.create.platform')
async create(@Body() dto: CreateTenantDto) {
  return this.service.create(dto);
}
```

#### 3. Service Method
**File**: `backend/src/modules/tenants/tenants.service.ts`

**Add method**:
```typescript
async create(dto: CreateTenantDto): Promise<Tenant> {
  // 1. Check slug uniqueness
  // 2. Create tenant schema
  // 3. Run initial migrations
  // 4. Create default roles/permissions
  // 5. Return tenant
}
```

#### 4. DTO
**File**: `backend/src/modules/tenants/dto/create-tenant.dto.ts`

**Create new file**:
```typescript
export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  primary_color?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  secondary_color?: string;
}
```

#### 5. Frontend Service
**File**: `frontend/lib/api/services/tenants.service.ts`

**Add method**:
```typescript
async create(data: CreateTenantDto): Promise<Tenant> {
  const response = await apiClient.post('/api/tenants', data);
  return response.data;
}
```

**Acceptance Criteria**:
- [ ] Form validation bekerja dengan baik
- [ ] Slug auto-generate dari name (lowercase, hyphenated)
- [ ] Slug uniqueness check di backend
- [ ] Logo upload dengan preview
- [ ] Color picker untuk primary/secondary color
- [ ] Success toast dengan redirect ke detail page
- [ ] Error handling dengan pesan Indonesian
- [ ] Loading state saat submit

**Testing Checklist**:
- [ ] Create dengan data minimal (name + slug only)
- [ ] Create dengan semua field
- [ ] Slug duplicate error handling
- [ ] Invalid format validation (colors, file size)
- [ ] Cancel button kembali ke list

---

### TASK 7.3: Edit Tenant Form

**Priority**: P0 - URGENT
**Estimated Time**: 3 hours
**Dependencies**: TASK 7.2 (Create Form)

**Objective**:
Membuat halaman edit tenant dengan form yang sama seperti create, tapi pre-filled dengan data existing.

**Deliverables**:

#### 1. Edit Form Page
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/edit/page.tsx`

**Features**:
- [ ] Reuse form component dari create page
- [ ] Fetch existing tenant data
- [ ] Pre-fill form dengan data tenant
- [ ] Update logo (replace existing)
- [ ] Cannot change slug (disabled/readonly)

#### 2. Backend API Endpoint
**File**: `backend/src/modules/tenants/tenants.controller.ts`

**Endpoint**: `PATCH /api/tenants/:id`

**Add to controller**:
```typescript
@Patch(':id')
@Permissions('tenants.update.platform')
async update(@Param('id') id: number, @Body() dto: UpdateTenantDto) {
  return this.service.update(id, dto);
}
```

#### 3. DTO
**File**: `backend/src/modules/tenants/dto/update-tenant.dto.ts`

**Create new file**:
```typescript
export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  // All fields optional except slug (not updatable)
}
```

#### 4. Frontend Service
**File**: `frontend/lib/api/services/tenants.service.ts`

**Add method**:
```typescript
async update(id: number, data: UpdateTenantDto): Promise<Tenant> {
  const response = await apiClient.patch(`/api/tenants/${id}`, data);
  return response.data;
}
```

**Acceptance Criteria**:
- [ ] Form pre-filled dengan data tenant
- [ ] Slug field disabled (tidak bisa diubah)
- [ ] Update logo dengan preview existing
- [ ] Validation sama dengan create form
- [ ] Success toast dengan redirect ke detail page
- [ ] Cancel button kembali ke detail page

**Testing Checklist**:
- [ ] Load existing tenant data
- [ ] Update name only
- [ ] Update colors only
- [ ] Replace logo
- [ ] Validation errors
- [ ] Concurrent edit handling

---

### TASK 7.4: Settings Tab Implementation

**Priority**: P1 - HIGH
**Estimated Time**: 3 hours
**Dependencies**: TASK 7.3 (Edit Form)

**Objective**:
Mengimplementasikan tab Settings di tenant detail page dengan configuration options.

**Deliverables**:

#### 1. Settings UI
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx`

**Replace placeholder dengan**:
```typescript
<TabsContent value="settings" className="mt-6 space-y-6">
  {/* Branding Settings */}
  <SettingsSection title="Branding" icon={Palette}>
    <BrandingSettings tenant={tenant} onUpdate={fetchTenantDetail} />
  </SettingsSection>

  {/* General Settings */}
  <SettingsSection title="Pengaturan Umum" icon={Settings}>
    <GeneralSettings tenant={tenant} onUpdate={fetchTenantDetail} />
  </SettingsSection>

  {/* Danger Zone */}
  <SettingsSection title="Danger Zone" icon={AlertTriangle} variant="danger">
    <DangerZoneSettings tenant={tenant} />
  </SettingsSection>
</TabsContent>
```

#### 2. Components

**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/settings/branding-settings.tsx`

**Features**:
- [ ] Logo upload/change
- [ ] Primary color picker
- [ ] Secondary color picker
- [ ] Favicon upload
- [ ] Preview branding changes
- [ ] Save button

**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/settings/general-settings.tsx`

**Features**:
- [ ] Timezone selector
- [ ] Date format
- [ ] Language preference
- [ ] Default currency
- [ ] Contact email
- [ ] Save button

**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/settings/danger-zone-settings.tsx`

**Features**:
- [ ] Deactivate tenant (with confirmation)
- [ ] Delete tenant (with double confirmation)
- [ ] Export tenant data
- [ ] Transfer ownership

#### 3. Backend Config Storage

**Add to tenants table**:
```sql
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS config JSONB;
```

**Config structure**:
```typescript
interface TenantConfig {
  timezone: string;
  date_format: string;
  language: string;
  currency: string;
  contact_email: string;
  features: {
    [feature: string]: boolean;
  };
}
```

**Acceptance Criteria**:
- [ ] Settings tersimpan di database
- [ ] Real-time preview untuk branding changes
- [ ] Confirmation dialog untuk danger actions
- [ ] Settings load saat tab aktif
- [ ] Toast feedback untuk setiap action

---

### TASK 7.5: Add Users to Tenant

**Priority**: P1 - HIGH
**Estimated Time**: 4 hours
**Dependencies**: None

**Objective**:
Menambahkan fitur untuk assign users ke tenant dengan role selection.

**Deliverables**:

#### 1. Add Users Modal/Drawer
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/add-users-modal.tsx`

**Features**:
- [ ] Search available users (not yet in tenant)
- [ ] Multi-select users dengan checkbox
- [ ] Role selector per user atau bulk role
- [ ] Preview selected users
- [ ] Bulk assign button

#### 2. UI Integration
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx`

**Add button di Users tab**:
```typescript
<Button onClick={() => setShowAddUsersModal(true)}>
  <Plus className="w-4 h-4 mr-2" />
  Tambah User
</Button>
```

#### 3. Backend API Endpoint
**File**: `backend/src/modules/tenants/tenants.controller.ts`

**Endpoint**: `POST /api/tenants/:id/users/bulk-add`

**Add to controller**:
```typescript
@Post(':id/users/bulk-add')
@Permissions('tenants.users.manage.platform')
async bulkAddUsers(
  @Param('id') tenantId: number,
  @Body() dto: BulkAddUsersDto
) {
  return this.service.bulkAddUsers(tenantId, dto);
}
```

#### 4. DTO
**File**: `backend/src/modules/tenants/dto/bulk-add-users.dto.ts`

```typescript
export class BulkAddUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  user_ids: number[];

  @IsNumber()
  @IsOptional()
  default_role_id?: number;

  @IsArray()
  @IsOptional()
  user_role_mapping?: Array<{
    user_id: number;
    role_id: number;
  }>;
}
```

#### 5. Service Method
**File**: `backend/src/modules/tenants/tenants.service.ts`

**Add method**:
```typescript
async bulkAddUsers(tenantId: number, dto: BulkAddUsersDto): Promise<void> {
  // 1. Validate users exist
  // 2. Check users not already in tenant
  // 3. Insert user_roles for each user
  // 4. Return success count
}
```

**Acceptance Criteria**:
- [ ] Search menampilkan users yang belum di tenant
- [ ] Multi-select dengan checkbox
- [ ] Assign role per user atau default role untuk semua
- [ ] Success toast dengan jumlah user yang ditambahkan
- [ ] Auto refresh user list setelah add
- [ ] Handle duplicate user error

---

### TASK 7.6: Modules Management

**Priority**: P1 - HIGH
**Estimated Time**: 3 hours
**Dependencies**: None

**Objective**:
Implement module management untuk enable/disable modules per tenant.

**Deliverables**:

#### 1. Enhanced Modules Tab UI
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx`

**Replace current modules display dengan**:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {availableModules.map((module) => (
    <ModuleCard
      key={module.id}
      module={module}
      enabled={isModuleEnabled(module.id)}
      onToggle={handleToggleModule}
    />
  ))}
</div>
```

#### 2. Module Card Component
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/module-card.tsx`

**Features**:
- [ ] Module icon & name
- [ ] Description
- [ ] Enable/disable toggle
- [ ] Configuration button (if module has config)
- [ ] Status badge

#### 3. Backend API Endpoints
**File**: `backend/src/modules/tenants/tenants.controller.ts`

**Endpoints**:
```typescript
@Post(':id/modules/:moduleId/enable')
async enableModule(@Param('id') tenantId: number, @Param('moduleId') moduleId: number) {
  return this.service.enableModule(tenantId, moduleId);
}

@Post(':id/modules/:moduleId/disable')
async disableModule(@Param('id') tenantId: number, @Param('moduleId') moduleId: number) {
  return this.service.disableModule(tenantId, moduleId);
}
```

**Acceptance Criteria**:
- [ ] List semua available modules
- [ ] Show which modules enabled for tenant
- [ ] Toggle enable/disable per module
- [ ] Confirmation dialog untuk critical modules
- [ ] Auto refresh after toggle

---

### TASK 7.7: Roles Management

**Priority**: P2 - MEDIUM
**Estimated Time**: 5 hours
**Dependencies**: None

**Objective**:
Menambahkan management roles di dalam tenant (bukan platform-wide).

**Deliverables**:

#### 1. Roles Section di Settings/New Tab
**Options**:
- A: Add sub-section di Settings tab
- B: Add new tab "Roles" (5 tabs total)

**Recommendation**: Option A (sub-section di Settings)

#### 2. Roles List & CRUD
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/roles-management.tsx`

**Features**:
- [ ] List roles dalam tenant
- [ ] Create new role
- [ ] Edit role name/description
- [ ] Delete role (dengan warning jika ada users)
- [ ] Assign permissions to role

#### 3. Backend Integration
**Uses existing roles module**, add:
- Filter by tenant
- Tenant-specific role creation
- Validation tenant context

**Acceptance Criteria**:
- [ ] CRUD roles per tenant
- [ ] Cannot delete role with assigned users
- [ ] Permissions management per role
- [ ] Search & filter roles

---

### TASK 7.8: Activity Logs

**Priority**: P2 - MEDIUM
**Estimated Time**: 4 hours
**Dependencies**: Audit system must exist

**Objective**:
Menampilkan activity timeline untuk tenant.

**Deliverables**:

#### 1. Activity Tab/Section
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/activity-timeline.tsx`

**Features**:
- [ ] Timeline view of activities
- [ ] Filter by user
- [ ] Filter by action type
- [ ] Filter by date range
- [ ] Export logs
- [ ] Pagination

#### 2. Backend API
**File**: `backend/src/modules/tenants/tenants.controller.ts`

**Endpoint**: `GET /api/tenants/:id/activity-logs`

**Query params**:
- user_id (optional)
- action_type (optional)
- start_date (optional)
- end_date (optional)
- page, limit

**Acceptance Criteria**:
- [ ] Display activities dengan user info
- [ ] Filters bekerja dengan baik
- [ ] Pagination
- [ ] Export to CSV

---

### TASK 7.9: Analytics Dashboard (Low Priority)

**Priority**: P3 - LOW
**Estimated Time**: 6 hours
**Dependencies**: Stats API must be available

**Features**:
- User growth chart
- Module usage stats
- API call statistics
- Storage usage
- Active users trends

**Defer to later sprint**

---

### TASK 7.10: Bulk Import/Export (Low Priority)

**Priority**: P3 - LOW
**Estimated Time**: 5 hours

**Features**:
- Export tenants to CSV/JSON
- Import tenants from CSV
- Bulk create with validation
- Progress indicator

**Defer to later sprint**

---

## Implementation Order

### Week 1 - Quick Wins & Core Features
1. TASK 7.1: Rows Per Page Selector (0.5h) - DONE FIRST
2. TASK 7.2: Create Tenant Form (4h)
3. TASK 7.3: Edit Tenant Form (3h)

### Week 2 - Important Features
4. TASK 7.4: Settings Tab (3h)
5. TASK 7.5: Add Users to Tenant (4h)
6. TASK 7.6: Modules Management (3h)

### Week 3 - Enhancements (if time permits)
7. TASK 7.7: Roles Management (5h)
8. TASK 7.8: Activity Logs (4h)

### Future Sprint
9. TASK 7.9: Analytics Dashboard (6h)
10. TASK 7.10: Bulk Import/Export (5h)

---

## Technical Notes

### Shared Components to Create
- `SettingsSection.tsx` - Wrapper untuk settings sections
- `ModuleCard.tsx` - Card untuk display module
- `ActivityTimeline.tsx` - Timeline component untuk logs
- `UserSelector.tsx` - Reusable multi-select user component

### API Endpoints to Add
```
POST   /api/tenants                          - Create tenant
PATCH  /api/tenants/:id                      - Update tenant
POST   /api/tenants/:id/users/bulk-add       - Bulk add users
POST   /api/tenants/:id/modules/:mid/enable  - Enable module
POST   /api/tenants/:id/modules/:mid/disable - Disable module
GET    /api/tenants/:id/activity-logs        - Get activity logs
```

### Database Changes
```sql
-- Add config column to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS config JSONB;

-- Add tenant_modules table (if not exists)
CREATE TABLE IF NOT EXISTS public.tenant_modules (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  module_id BIGINT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB,
  enabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, module_id)
);
```

---

## Success Metrics

**When all P0-P1 tasks complete**:
- [ ] Users can create new tenants via UI
- [ ] Users can edit tenant information
- [ ] Users can configure basic settings
- [ ] Users can add/remove users from tenants
- [ ] Users can enable/disable modules per tenant
- [ ] All tables have consistent UX (rows per page selector)

---

## Related Issues

GitHub issues akan dibuat untuk setiap task dengan format:
- `[TASK 7.1] Rows Per Page Selector - Tenant List Page`
- `[TASK 7.2] Create Tenant Form - Form Pembuatan Tenant Baru`
- `[TASK 7.3] Edit Tenant Form - Form Edit Tenant`
- dst...

---

**Last Updated**: 2026-07-19
**Total Estimated Time**: 40.5 hours (P0-P2 tasks only)
**Sprint**: Multi-week project
