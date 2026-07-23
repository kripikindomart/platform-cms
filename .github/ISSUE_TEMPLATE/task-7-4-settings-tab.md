---
name: Task 7.4 - Settings Tab Implementation
about: Implementasi tab Settings di tenant detail page dengan form konfigurasi
title: '[TASK-7.4] Settings Tab - Konfigurasi Tenant'
labels: 'enhancement, frontend, P1-high'
assignees: ''
---

## Task Information

**Task ID**: 7.4  
**Title**: Settings Tab Implementation  
**Priority**: P1 - HIGH  
**Estimated Time**: 3 jam  
**Status**: BELUM DIMULAI

**Dependencies**: 
- TASK 7.2: Create Tenant Form (COMPLETE)
- TASK 7.3: Edit Tenant Form (COMPLETE)

**Sprint**: Week 30-31 - Tenant Module Enhancement

---

## Tujuan Task

Mengimplementasikan tab Settings di tenant detail page dengan form konfigurasi lengkap. Saat ini tab Settings hanya placeholder kosong.

**Kenapa Ini Penting**:
- User bisa konfigurasi tenant settings (timezone, language, dll)
- User bisa update branding (logo, colors)
- User bisa manage tenant lifecycle (deactivate, delete)
- Centralized tenant configuration management

---

## Yang Akan Dikerjakan

### Langkah 1: Buat Settings Components
**Folder**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/settings/`

**Files to create**:

#### 1.1. Branding Settings Component
**File**: `branding-settings.tsx`

**Features**:
- Logo upload/change dengan preview
- Primary color picker
- Secondary color picker
- Preview branding changes
- Save button

**Props**:
```typescript
interface BrandingSettingsProps {
  tenant: Tenant;
  onUpdate: () => void;
}
```

#### 1.2. General Settings Component
**File**: `general-settings.tsx`

**Features**:
- Timezone selector (dropdown dengan common timezones)
- Date format selector (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- Language preference (Indonesia, English)
- Contact email input
- Save button

**Props**:
```typescript
interface GeneralSettingsProps {
  tenant: Tenant;
  onUpdate: () => void;
}
```

#### 1.3. Danger Zone Component
**File**: `danger-zone-settings.tsx`

**Features**:
- Deactivate tenant button (dengan confirmation dialog)
- Delete tenant button (dengan double confirmation)
- Warning messages yang jelas
- Danger styling (red borders, red buttons)

**Props**:
```typescript
interface DangerZoneSettingsProps {
  tenant: Tenant;
}
```

---

### Langkah 2: Update Tenant Detail Page
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx`

**Apa yang dikerjakan**:
1. Import components yang baru dibuat
2. Replace placeholder di Settings tab dengan components

**Code SEBELUM**:
```typescript
<TabsContent value="settings" className="mt-6">
  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
    <Settings className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
      Tenant Settings
    </h3>
    <p className="text-neutral-600">
      Pengaturan dan konfigurasi tenant akan ditampilkan di sini
    </p>
  </div>
</TabsContent>
```

**Code SESUDAH**:
```typescript
<TabsContent value="settings" className="mt-6 space-y-6">
  {/* Branding Settings */}
  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
        <Palette className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-neutral-900">Branding</h3>
        <p className="text-sm text-neutral-600">Logo, colors, dan tampilan visual</p>
      </div>
    </div>
    <BrandingSettings tenant={tenant} onUpdate={fetchTenantDetail} />
  </div>

  {/* General Settings */}
  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
        <Settings className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-neutral-900">Pengaturan Umum</h3>
        <p className="text-sm text-neutral-600">Timezone, bahasa, dan preferensi lainnya</p>
      </div>
    </div>
    <GeneralSettings tenant={tenant} onUpdate={fetchTenantDetail} />
  </div>

  {/* Danger Zone */}
  <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
        <p className="text-sm text-red-700">Tindakan yang tidak dapat dibatalkan</p>
      </div>
    </div>
    <DangerZoneSettings tenant={tenant} />
  </div>
</TabsContent>
```

**Import statements to add**:
```typescript
import { Palette, AlertTriangle } from 'lucide-react';
import BrandingSettings from './components/settings/branding-settings';
import GeneralSettings from './components/settings/general-settings';
import DangerZoneSettings from './components/settings/danger-zone-settings';
```

---

### Langkah 3: Update Backend - Tenant Config
**File**: `backend/src/modules/tenants/tenants.service.ts`

**Add method untuk update config**:
```typescript
async updateConfig(id: number, config: any): Promise<Tenant> {
  const tenant = await this.repository.findById(id);
  if (!tenant) {
    throw new NotFoundException({
      code: 'TENANT_NOT_FOUND',
      message: 'Tenant tidak ditemukan',
    });
  }

  return this.repository.update(id, {
    config: config,
    updated_at: new Date(),
  });
}
```

**Update Controller**:
```typescript
@Patch(':id/config')
@Permissions('tenants.update.platform')
async updateConfig(
  @Param('id') id: number,
  @Body() config: any
) {
  return this.service.updateConfig(id, config);
}
```

---

### Langkah 4: Create DTO for Config
**File**: `backend/src/modules/tenants/dto/tenant-config.dto.ts`

```typescript
export class TenantConfigDto {
  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  date_format?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsObject()
  @IsOptional()
  features?: Record<string, boolean>;
}
```

---

## Kriteria Selesai (Checklist)

### UI Components
- [ ] BrandingSettings component dibuat
- [ ] GeneralSettings component dibuat
- [ ] DangerZoneSettings component dibuat
- [ ] Components di-import ke tenant detail page
- [ ] Settings tab tidak lagi placeholder

### Branding Settings
- [ ] Logo upload dengan preview
- [ ] Primary color picker (hex color)
- [ ] Secondary color picker (hex color)
- [ ] Save button berfungsi
- [ ] Changes reflected setelah save

### General Settings
- [ ] Timezone dropdown dengan options (UTC, Asia/Jakarta, dll)
- [ ] Date format dropdown (3 options)
- [ ] Language dropdown (Indonesia, English)
- [ ] Contact email input dengan validasi
- [ ] Save button berfungsi

### Danger Zone
- [ ] Deactivate button dengan confirmation dialog
- [ ] Delete button dengan double confirmation (type "DELETE" to confirm)
- [ ] Danger styling (red theme)
- [ ] Warning messages yang jelas

### Backend
- [ ] Config column di tenants table (JSONB)
- [ ] PATCH /api/tenants/:id/config endpoint
- [ ] TenantConfigDto validation
- [ ] Config tersimpan di database

### Testing
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Upload logo berfungsi
- [ ] Save settings berfungsi
- [ ] Deactivate tenant berfungsi
- [ ] Delete tenant berfungsi

---

## Cara Testing

### Test 1: Branding Settings
```bash
# Langkah:
1. Buka tenant detail page
2. Klik tab Settings
3. Di section Branding:
   - Upload logo baru (max 2MB)
   - Pilih primary color (gunakan color picker)
   - Pilih secondary color
   - Klik Save
4. Refresh page
5. Verify changes tersimpan
```

**Expected Result**: Logo dan colors ter-update, perubahan persist setelah refresh

---

### Test 2: General Settings
```bash
# Langkah:
1. Di section General Settings:
   - Pilih timezone: "Asia/Jakarta"
   - Pilih date format: "DD/MM/YYYY"
   - Pilih language: "Indonesia"
   - Input contact email: "admin@tenant.com"
   - Klik Save
2. Refresh page
3. Verify settings tersimpan
```

**Expected Result**: Settings ter-update dan persist setelah refresh

---

### Test 3: Deactivate Tenant
```bash
# Langkah:
1. Di section Danger Zone
2. Klik "Deactivate Tenant"
3. Confirmation dialog muncul
4. Klik "Ya, Nonaktifkan"
5. Verify tenant status berubah jadi inactive
```

**Expected Result**: Tenant is_active = false, status badge berubah

---

### Test 4: Delete Tenant (Soft Delete)
```bash
# Langkah:
1. Di section Danger Zone
2. Klik "Delete Tenant"
3. Double confirmation dialog muncul
4. Type "DELETE" di input
5. Klik "Ya, Hapus Permanen"
6. Redirect ke tenant list
7. Verify tenant tidak muncul di active list
8. Cek di Trash tab, tenant ada di sana
```

**Expected Result**: Tenant soft deleted, muncul di trash

---

## Files to Create/Modify

### New Files
```
frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/settings/
├── branding-settings.tsx          # Branding form
├── general-settings.tsx           # General settings form
└── danger-zone-settings.tsx       # Danger actions

backend/src/modules/tenants/dto/
└── tenant-config.dto.ts           # Config validation DTO
```

### Modified Files
```
frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx
backend/src/modules/tenants/tenants.service.ts
backend/src/modules/tenants/tenants.controller.ts
```

---

## Common Pitfalls (Kesalahan Umum)

### 1. Lupa Validasi di Backend
[X] **SALAH**: Simpan config tanpa validasi
```typescript
await repository.update(id, { config: req.body }); // ❌ Tidak aman
```

[OK] **BENAR**: Validate dengan DTO
```typescript
@Body() config: TenantConfigDto // ✅ Validated
```

---

### 2. Tidak Handle Empty Config
**Problem**: Config bisa null/undefined saat pertama kali

**Solution**:
```typescript
const currentConfig = tenant.config || {};
const newConfig = {
  ...currentConfig,
  ...updates
};
```

---

### 3. Logo Upload Tanpa Size Limit
**Problem**: User upload file besar, server overload

**Solution**:
- Frontend: Check file size < 2MB
- Backend: Add file size validation
- Use image compression

---

### 4. Delete Current Tenant
**Problem**: User bisa delete tenant yang sedang aktif

**Solution**:
```typescript
if (isCurrentTenant(tenant.id)) {
  toast.error('Tidak bisa menghapus tenant yang sedang aktif');
  return;
}
```

---

## Design Guidelines

**WAJIB mengikuti Premium Template Builder skill**:

### Colors
```typescript
// Branding section
from-purple-500 to-pink-600   // Icon gradient
shadow-lg shadow-purple-500/30 // Soft shadow

// General section  
from-blue-500 to-cyan-600     // Icon gradient
shadow-lg shadow-blue-500/30  // Soft shadow

// Danger zone
bg-red-50                     // Background
border-red-200                // Border (2px)
bg-red-600                    // Icon background
text-red-900                  // Heading
text-red-700                  // Description
```

### Spacing
```
p-6        // Card padding
mb-6       // Section margin bottom
gap-3      // Icon & text gap
space-y-6  // Between sections
```

### Rounded Corners
```
rounded-2xl   // Cards
rounded-xl    // Icons, buttons
```

---

## Documentation References

**Code References**:
- Create tenant form: `frontend/app/(private)/org/[tenant]/portal/tenants/create/page.tsx`
- Edit tenant form: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/edit/page.tsx`
- Premium design: `.kiro/skills/premium-template-builder.md`

**Related Docs**:
- Master plan: `.kiro/specs/tenant-module-enhancement.md`
- Platform rules: `.kiro/skills/platform-cms-rules.md`

---

## Success Criteria

**DONE when**:
- [ ] Settings tab tidak lagi placeholder
- [ ] Branding settings berfungsi (logo, colors)
- [ ] General settings berfungsi (timezone, language, etc)
- [ ] Danger zone berfungsi (deactivate, delete)
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Manual testing complete (all 4 tests)
- [ ] Premium UI design (gradient, shadows, rounded corners)
- [ ] Backend config storage berfungsi

---

## Implementation Notes

**Time Estimate Breakdown**:
- Component creation: 1.5 jam
- Backend API: 0.5 jam
- Integration & testing: 1 jam

**Total: 3 jam**

**Implementation Priority**:
1. Create components FIRST (branding, general, danger)
2. Integrate to tenant detail page SECOND
3. Add backend API THIRD
4. Testing LAST

**Design Focus**:
- Use premium gradients dan soft shadows
- Rounded corners (rounded-2xl for cards)
- Consistent spacing (8px grid)
- Clear danger zone styling

---

## Next Task

Setelah task ini selesai:
- Lanjut ke **Task 7.5: Add Users to Tenant** (bulk assign users)

---

## Output Expected

Setelah task selesai:
1. Settings tab fully functional
2. User bisa update branding (logo, colors)
3. User bisa configure general settings (timezone, language)
4. User bisa deactivate/delete tenant dari UI
5. All settings persist di database
6. Premium UI dengan gradient backgrounds dan soft shadows

**Visual**: Settings tab dengan 3 sections (Branding, General, Danger Zone), masing-masing dengan gradient icon, clear heading, dan functional form.

---

**Created**: 2026-07-21  
**Sprint**: Week 30-31  
**Phase**: Tenant Module Enhancement  
**Related**: Part of master plan in `.kiro/specs/tenant-module-enhancement.md`
