---
name: Task 7.5 - Add Users to Tenant
about: Implementasi fitur untuk assign/add users ke tenant dengan role selection
title: '[TASK-7.5] Add Users to Tenant - Bulk Assign'
labels: 'enhancement, frontend, backend, P1-high'
assignees: ''
---

## Task Information

**Task ID**: 7.5  
**Title**: Add Users to Tenant  
**Priority**: P1 - HIGH  
**Estimated Time**: 4 jam  
**Status**: BELUM DIMULAI

**Dependencies**: None

**Sprint**: Week 30-31 - Tenant Module Enhancement

---

## Tujuan Task

Menambahkan fitur untuk assign/add users ke tenant dengan role selection. Saat ini di Users tab hanya bisa remove users, perlu fitur untuk add users.

**Kenapa Ini Penting**:
- User management yang complete (add & remove)
- Bulk assign users untuk efficiency
- Role assignment saat add user
- Centralized user-tenant management

---

## Yang Akan Dikerjakan

### Langkah 1: Create Add Users Modal Component
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/add-users-modal.tsx`

**Features**:
- Modal/Drawer untuk add users
- Search available users (belum di tenant)
- Multi-select dengan checkbox
- Role selector (dropdown atau per user)
- Preview selected users
- Bulk assign button

**Props**:
```typescript
interface AddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: number;
  onSuccess: () => void;
}
```

**UI Sections**:
1. Search bar untuk filter users
2. User list dengan checkbox
3. Role selector (default role untuk semua atau per user)
4. Selected users preview
5. Assign button

---

### Langkah 2: Update Tenant Detail Page
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx`

**Apa yang dikerjakan**:
1. Add state untuk modal: `const [showAddUsersModal, setShowAddUsersModal] = useState(false);`
2. Add "Tambah User" button di Users tab header
3. Import dan render AddUsersModal component

**Code to Add**:

**Button di Users tab** (setelah search bar):
```typescript
<div className="flex items-center gap-4">
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
    <Input
      placeholder="Search users..."
      value={usersSearch}
      onChange={(e) => setUsersSearch(e.target.value)}
      className="pl-10"
    />
  </div>
  <Button
    onClick={() => setShowAddUsersModal(true)}
    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all gap-2"
  >
    <Plus className="w-4 h-4" />
    Tambah User
  </Button>
</div>
```

**Modal render** (sebelum closing div):
```typescript
<AddUsersModal
  isOpen={showAddUsersModal}
  onClose={() => setShowAddUsersModal(false)}
  tenantId={Number(tenantId)}
  onSuccess={fetchUsersData}
/>
```

---

### Langkah 3: Backend API - Get Available Users
**File**: `backend/src/modules/tenants/tenants.controller.ts`

**Endpoint**: `GET /api/tenants/:id/available-users`

**Add to controller**:
```typescript
@Get(':id/available-users')
@CheckPolicies((ability) => ability.can('read', 'tenants'))
@ApiOperation({ summary: 'Get users not in tenant' })
@ApiResponse({ status: 200, description: 'Available users retrieved' })
async getAvailableUsers(
  @Param('id', ParseIntPipe) id: number,
  @Query('search') search?: string,
): Promise<any[]> {
  return this.tenantsService.getAvailableUsers(id, search);
}
```

**Service method** (`tenants.service.ts`):
```typescript
async getAvailableUsers(tenantId: number, search?: string): Promise<any[]> {
  // Get all users from public.users
  // Exclude users already in this tenant
  // Apply search filter if provided
  // Return user list
}
```

---

### Langkah 4: Backend API - Bulk Add Users
**File**: `backend/src/modules/tenants/tenants.controller.ts`

**Endpoint**: `POST /api/tenants/:id/users/bulk-add`

**Add to controller**:
```typescript
@Post(':id/users/bulk-add')
@CheckPolicies((ability) => ability.can('update', 'tenants'))
@ApiOperation({ summary: 'Bulk add users to tenant' })
@ApiResponse({ status: 200, description: 'Users added to tenant' })
async bulkAddUsers(
  @Param('id', ParseIntPipe) tenantId: number,
  @Body() dto: BulkAddUsersDto,
  @CurrentUser() user: any,
): Promise<{ success: number; failed: number; errors: any[] }> {
  return this.tenantsService.bulkAddUsers(tenantId, dto, user.id);
}
```

---

### Langkah 5: Create DTO
**File**: `backend/src/modules/tenants/dto/bulk-add-users.dto.ts`

```typescript
import { IsArray, IsNumber, IsOptional, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserRoleMapping {
  @IsNumber()
  user_id!: number;

  @IsNumber()
  role_id!: number;
}

export class BulkAddUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  user_ids!: number[];

  @IsNumber()
  @IsOptional()
  default_role_id?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserRoleMapping)
  user_role_mapping?: UserRoleMapping[];
}
```

---

### Langkah 6: Implement Service Method
**File**: `backend/src/modules/tenants/tenants.service.ts`

**Method**: `bulkAddUsers`

**Logic**:
1. Validate tenant exists
2. Get tenant schema name
3. Validate users exist (dari public.users)
4. Check users belum ada di tenant
5. Get default role ID jika tidak ada mapping
6. Insert ke tenant_X.user_roles untuk setiap user
7. Return success count dan errors

```typescript
async bulkAddUsers(
  tenantId: number,
  dto: BulkAddUsersDto,
  userId: number,
): Promise<{ success: number; failed: number; errors: any[] }> {
  this.logger.log(`Bulk adding users to tenant ${tenantId} by user ${userId}`);

  // Get tenant
  const tenant = await this.tenantsRepository.findById(tenantId);
  if (!tenant) {
    throw new NotFoundException({
      code: 'TENANT_NOT_FOUND',
      message: 'Tenant tidak ditemukan',
    });
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  // Set tenant context
  this.tenantContext.setTenant({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    schemaName: tenant.schema_name,
  });

  // Process each user
  for (const uid of dto.user_ids) {
    try {
      // Find role for this user
      let roleId = dto.default_role_id;
      if (dto.user_role_mapping) {
        const mapping = dto.user_role_mapping.find(m => m.user_id === uid);
        if (mapping) roleId = mapping.role_id;
      }

      if (!roleId) {
        throw new Error('Role ID required');
      }

      // Check if user already in tenant
      const existing = await this.db.execute(sql`
        SELECT id FROM ${sql.identifier(tenant.schema_name)}.user_roles
        WHERE user_id = ${uid} AND role_id = ${roleId}
        LIMIT 1
      `);

      if (existing.rows.length > 0) {
        throw new Error('User already in tenant');
      }

      // Add user to tenant
      await this.db.execute(sql`
        INSERT INTO ${sql.identifier(tenant.schema_name)}.user_roles 
        (user_id, role_id, created_at, updated_at)
        VALUES (${uid}, ${roleId}, NOW(), NOW())
      `);

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        user_id: uid,
        message: error.message,
      });
    }
  }

  this.logger.log(`✅ Bulk add complete: ${results.success} success, ${results.failed} failed`);

  return results;
}
```

---

### Langkah 7: Frontend Service Method
**File**: `frontend/lib/api/services/tenants.service.ts`

**Add methods**:
```typescript
/**
 * Get users not in tenant (available to add)
 */
async getAvailableUsers(tenantId: number, search?: string): Promise<any[]> {
  const params: any = {};
  if (search) params.search = search;
  return await apiClient.get(`/tenants/${tenantId}/available-users`, { params });
},

/**
 * Bulk add users to tenant
 */
async bulkAddUsers(
  tenantId: number,
  data: {
    user_ids: number[];
    default_role_id?: number;
    user_role_mapping?: Array<{ user_id: number; role_id: number }>;
  }
): Promise<{ success: number; failed: number; errors: any[] }> {
  return await apiClient.post(`/tenants/${tenantId}/users/bulk-add`, data);
},
```

---

## Kriteria Selesai (Checklist)

### UI Component
- [ ] AddUsersModal component dibuat
- [ ] Search bar untuk filter users
- [ ] User list dengan checkbox
- [ ] Role selector (default atau per user)
- [ ] Selected users preview
- [ ] Modal bisa dibuka dari Users tab

### Functionality
- [ ] Search users berfungsi
- [ ] Multi-select users dengan checkbox
- [ ] Select all / deselect all
- [ ] Assign default role untuk semua users
- [ ] OR assign role per user (optional enhancement)
- [ ] Bulk add berfungsi
- [ ] Success/error messages yang jelas

### Backend
- [ ] GET /api/tenants/:id/available-users endpoint
- [ ] POST /api/tenants/:id/users/bulk-add endpoint
- [ ] BulkAddUsersDto validation
- [ ] Service method getAvailableUsers
- [ ] Service method bulkAddUsers
- [ ] Error handling untuk duplicate users

### Testing
- [ ] Type-check passes (frontend & backend)
- [ ] Lint passes
- [ ] Add single user berfungsi
- [ ] Add multiple users berfungsi
- [ ] Duplicate user handling
- [ ] Users list auto refresh setelah add

---

## Cara Testing

### Test 1: Add Single User
```bash
# Langkah:
1. Buka tenant detail page
2. Klik tab Users
3. Klik button "Tambah User"
4. Modal opens
5. Search user (e.g., "john")
6. Select 1 user dengan checkbox
7. Pilih role dari dropdown (e.g., "Admin")
8. Klik "Assign Users"
9. Verify success toast
10. Verify user muncul di users list
```

**Expected Result**: User berhasil ditambahkan dengan role yang dipilih

---

### Test 2: Add Multiple Users
```bash
# Langkah:
1. Klik "Tambah User"
2. Select 3-5 users dengan checkbox
3. Pilih default role (e.g., "Member")
4. Klik "Assign Users"
5. Verify success toast dengan count
6. Verify semua users muncul di list
```

**Expected Result**: Semua users berhasil ditambahkan dengan role default

---

### Test 3: Duplicate User Handling
```bash
# Langkah:
1. Add user yang sudah ada di tenant
2. Verify error message muncul
3. User tidak di-add ulang
```

**Expected Result**: Error message "User already in tenant"

---

### Test 4: Search Available Users
```bash
# Langkah:
1. Open modal
2. Type di search box (e.g., "admin")
3. Verify only matching users muncul
4. Clear search
5. Verify all available users muncul
```

**Expected Result**: Search filter bekerja dengan baik

---

## Files to Create/Modify

### New Files
```
frontend/app/(private)/org/[tenant]/portal/tenants/[id]/components/
└── add-users-modal.tsx                    # Main modal component

backend/src/modules/tenants/dto/
└── bulk-add-users.dto.ts                  # DTO validation
```

### Modified Files
```
frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx
frontend/lib/api/services/tenants.service.ts
backend/src/modules/tenants/tenants.controller.ts
backend/src/modules/tenants/tenants.service.ts
```

---

## Common Pitfalls (Kesalahan Umum)

### 1. Query Users dari Tenant Schema
[X] **SALAH**: Query dari tenant schema
```typescript
// Users ada di public.users, bukan tenant_X.users
SELECT * FROM tenant_1.users; // ❌ WRONG
```

[OK] **BENAR**: Query dari public schema
```typescript
SELECT * FROM public.users
WHERE id NOT IN (
  SELECT user_id FROM tenant_1.user_roles
); // ✅ CORRECT
```

---

### 2. Lupa Exclude Users yang Sudah Ada
**Problem**: User muncul di available list padahal sudah di tenant

**Solution**:
```typescript
// Exclude users already in tenant
const existingUserIds = await getUserIdsInTenant(tenantId);
const availableUsers = allUsers.filter(u => !existingUserIds.includes(u.id));
```

---

### 3. No Default Role Selected
**Problem**: User pilih users tapi lupa pilih role

**Solution**:
- Require role selection (disabled button jika role kosong)
- Atau set default role otomatis (e.g., "Member" role)

---

## Design Guidelines

**WAJIB mengikuti Premium Template Builder skill**:

### Modal Design
```typescript
// Premium modal styling
<Dialog>
  <DialogContent className="max-w-4xl">
    <DialogHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 -m-6 p-6 mb-6 rounded-t-2xl border-b border-neutral-200">
      <DialogTitle className="text-2xl font-bold text-neutral-900">
        Tambah User ke Tenant
      </DialogTitle>
      <DialogDescription className="text-neutral-600">
        Pilih users dan assign role untuk menambahkan ke tenant
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### User Card Design
```typescript
<div className="p-4 border border-neutral-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
  <div className="flex items-center gap-3">
    <Checkbox checked={selected} />
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
      {user.name.charAt(0)}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-neutral-900">{user.name}</p>
      <p className="text-sm text-neutral-500">{user.email}</p>
    </div>
  </div>
</div>
```

---

## Documentation References

**Code References**:
- Users tab: `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx` (line 680+)
- Remove users functionality: Reference implementation

**Related Docs**:
- Master plan: `.kiro/specs/tenant-module-enhancement.md`
- Premium design: `.kiro/skills/premium-template-builder.md`

---

## Success Criteria

**DONE when**:
- [ ] Modal UI berfungsi dan premium design
- [ ] Search users berfungsi
- [ ] Multi-select berfungsi
- [ ] Bulk add users berfungsi
- [ ] Role assignment berfungsi
- [ ] Users list auto refresh
- [ ] Type-check passes (frontend & backend)
- [ ] Error handling untuk edge cases
- [ ] Success/error toast messages

---

## Implementation Notes

**Time Estimate Breakdown**:
- Modal component: 1.5 jam
- Backend API: 1 jam
- Integration & testing: 1.5 jam

**Total: 4 jam**

**Implementation Priority**:
1. Backend API FIRST (available users, bulk add)
2. Frontend modal component SECOND
3. Integration THIRD
4. Testing LAST

---

## Next Task

Setelah task ini selesai:
- Lanjut ke **Task 7.6: Modules Management** (enable/disable modules per tenant)

---

## Output Expected

Setelah task selesai:
1. User bisa add users ke tenant via UI
2. Bulk assign multiple users sekaligus
3. Role selection saat add users
4. Search filter untuk find users
5. Complete user management (add + remove)

**Visual**: Modal dengan search bar, user list dengan checkbox, role selector, dan assign button. Premium design dengan gradient header dan smooth animations.

---

**Created**: 2026-07-21  
**Sprint**: Week 30-31  
**Phase**: Tenant Module Enhancement  
**Related**: Part of master plan in `.kiro/specs/tenant-module-enhancement.md`
