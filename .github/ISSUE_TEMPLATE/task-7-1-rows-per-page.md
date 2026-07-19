---
name: Task 7.1 - Rows Per Page Selector Tenant List
about: Menambahkan dropdown selector untuk rows per page di tenant list page
title: '[TASK-7.1] Rows Per Page Selector - Tenant List Page'
labels: 'enhancement, frontend, P0-critical'
assignees: ''
---

## Task Information

**Task ID**: 7.1  
**Title**: Rows Per Page Selector - Tenant List Page  
**Priority**: P0 - URGENT (Quick Win)  
**Estimated Time**: 0.5 jam  
**Status**: BELUM DIMULAI

**Dependencies**: None  
**Sprint**: Week 30-31 - Tenant Module Enhancement

---

## Tujuan Task

Menambahkan Rows Per Page Selector (dropdown) di halaman list tenant untuk konsistensi UX dengan halaman lain. Saat ini halaman users dan tenant detail sudah memiliki fitur ini, tapi tenant list page belum.

**Kenapa Ini Penting**:
- Konsistensi UX di seluruh aplikasi
- User bisa memilih berapa banyak data yang ditampilkan per halaman
- Improve user experience untuk handling large datasets
- Quick win - mudah dan cepat dikerjakan

---

## Yang Akan Dikerjakan

### Langkah 1: Update State Management
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/page.tsx`

**Apa yang dikerjakan**:
1. Buka file `tenants/page.tsx`
2. Cari baris `const [limit] = useState(10);` (sekitar line 59)
3. Ubah menjadi `const [limit, setLimit] = useState(10);`

**Code SEBELUM**:
```typescript
const [limit] = useState(10);
```

**Code SESUDAH**:
```typescript
const [limit, setLimit] = useState(10);
```

**Penjelasan**: Kita perlu `setLimit` agar limit bisa diubah oleh user via dropdown.

---

### Langkah 2: Tambahkan Selector UI
**File**: `frontend/app/(private)/org/[tenant]/portal/tenants/page.tsx`

**Apa yang dikerjakan**:
1. Scroll ke bagian pagination (sekitar line 620-630)
2. Cari section yang menampilkan "Showing X to Y of Z tenants"
3. Tambahkan Rows Per Page Selector DI SEBELAH pagination info

**Lokasi**: Di dalam kondisi `{totalPages > 1 && (...)}`

**Code SEBELUM**:
```typescript
{totalPages > 1 && (
  <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
    <div className="text-sm text-neutral-600">
      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} tenants
    </div>
    <div className="flex items-center gap-2">
      <Button ... >Previous</Button>
      {/* Page numbers */}
      <Button ... >Next</Button>
    </div>
  </div>
)}
```

**Code SESUDAH**:
```typescript
{totalPages > 1 && (
  <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="text-sm text-neutral-600">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} tenants
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 whitespace-nowrap">Rows per page:</span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            setLimit(Number(value));
            setPage(1); // Reset to page 1 on limit change
          }}
        >
          <SelectTrigger className="w-20 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <Button ... >Previous</Button>
      {/* Page numbers */}
      <Button ... >Next</Button>
    </div>
  </div>
)}
```

**Penjelasan Perubahan**:
- Wrap "Showing..." text dan selector dalam `<div className="flex items-center gap-4">`
- Tambahkan Select component dengan 4 options: 10, 25, 50, 100
- Saat value berubah, update `limit` dan reset `page` ke 1
- Selector height `h-9` agar konsisten dengan button heights

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

### UI Updates
- [ ] Selector muncul di kiri bawah tabel, sebelah "Showing..." text
- [ ] Options tersedia: 10, 25, 50, 100
- [ ] Default value tampil: 10
- [ ] Styling konsisten dengan tenant detail page

### Functionality
- [ ] Saat user pilih 25, table reload dengan 25 rows
- [ ] Saat user pilih 50, table reload dengan 50 rows
- [ ] Saat user pilih 100, table reload dengan 100 rows
- [ ] Auto reset ke page 1 saat limit berubah
- [ ] Pagination recalculate berdasarkan limit baru

### Code Quality
- [ ] Import Select sudah ada (tidak perlu tambah import baru)
- [ ] Type-check passes
- [ ] Lint passes
- [ ] No console errors di browser

---

## Cara Testing

### Test 1: Default Behavior
```bash
# Langkah:
1. Buka browser
2. Navigate ke /tenants page
3. Verify table menampilkan 10 rows (default)
4. Verify selector menunjukkan "10"
```

**Expected Result**: Table shows 10 rows, selector shows "10"

---

### Test 2: Change Limit to 25
```bash
# Langkah:
1. Klik dropdown selector
2. Pilih "25"
3. Observe table reload
```

**Expected Result**: 
- Table now shows 25 rows
- Page number reset to 1
- Pagination info updates (e.g., "Showing 1 to 25 of 50 tenants")
- Selector shows "25"

---

### Test 3: Change Limit to 50
```bash
# Langkah:
1. Klik dropdown selector
2. Pilih "50"
3. Observe table reload
```

**Expected Result**: 
- Table shows 50 rows
- Page reset to 1
- Pagination recalculates

---

### Test 4: Change Limit to 100
```bash
# Langkah:
1. Klik dropdown selector
2. Pilih "100"
3. Observe table reload
```

**Expected Result**: 
- Table shows 100 rows (or all tenants if < 100)
- Page reset to 1
- If total < 100, pagination might disappear

---

### Test 5: Pagination After Limit Change
```bash
# Langkah:
1. Set limit to 25
2. Go to page 2
3. Change limit to 10
4. Verify page resets to 1
```

**Expected Result**: Page automatically resets to 1, not stuck on page 2

---

## Files to Modify

### 1. `frontend/app/(private)/org/[tenant]/portal/tenants/page.tsx`
**Changes**: 
- Line ~59: Change `const [limit] = useState(10);` to `const [limit, setLimit] = useState(10);`
- Line ~620-640: Add Select component in pagination section

**Total Lines Changed**: ~15 lines

---

## Common Pitfalls (Kesalahan Umum)

### 1. Lupa Reset Page ke 1
[X] **SALAH**: Change limit tanpa reset page
```typescript
setLimit(Number(value)); // Page tetap di halaman lama, bisa muncul empty table
```

[OK] **BENAR**: Reset page saat limit berubah
```typescript
setLimit(Number(value));
setPage(1); // WAJIB: Reset to first page
```

**Penjelasan**: Jika user di page 3 dengan limit 10 (showing item 21-30), lalu ganti limit ke 100, page 3 dengan limit 100 bisa jadi kosong. Makanya harus reset ke page 1.

---

### 2. Lupa Import Select Component
**Problem**: Component Select tidak ditemukan, muncul error saat compile

**Solution**: 
- Cek line ~20-30 untuk import statement
- Pastikan ada: `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-radix';`
- JANGAN gunakan `@/components/ui/select` (tanpa -radix)

**NOTE**: Import sudah ada di file, tidak perlu tambah baru!

---

### 3. Typo pada Value Prop
[X] **SALAH**: 
```typescript
<SelectItem value={10}>10</SelectItem> // number, bukan string
```

[OK] **BENAR**:
```typescript
<SelectItem value="10">10</SelectItem> // WAJIB string
```

**Penjelasan**: SelectItem value harus string, bukan number. Konversi ke number dilakukan saat `onValueChange` dengan `Number(value)`.

---

## Documentation References

**Code References**:
- `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx` - Line 620-650 (reference implementation)
- `frontend/app/(private)/org/[tenant]/portal/users/components/users-table.tsx` - Line 450-480 (reference implementation)

**Related Docs**:
- Shadcn Select component: https://ui.shadcn.com/docs/components/select
- Master plan: `.kiro/specs/tenant-module-enhancement.md`

---

## Success Criteria

**DONE when**:
- [ ] Selector tampil di UI dengan styling correct
- [ ] Semua 4 options (10, 25, 50, 100) bekerja
- [ ] Auto reset to page 1 saat limit change
- [ ] Type-check passes: `cd frontend && npm run type-check`
- [ ] Lint passes: `cd frontend && npm run lint`
- [ ] Manual testing complete (all 5 tests above)
- [ ] Screenshot attached di issue comment
- [ ] Consistent dengan halaman lain (users, tenant detail)

---

## Implementation Notes

**Time Estimate Breakdown**:
- Code changes: 10 menit (very simple change)
- Manual testing: 10 menit (test all options)
- Verification & screenshot: 10 menit

**Total: 30 menit** (estimate conservative 0.5 jam)

**Testing Priority**:
1. Test default (10 rows) FIRST
2. Test all options (25, 50, 100) SECOND
3. Test page reset behavior THIRD
4. Test pagination recalculation LAST

---

## What NOT to Implement

Defer untuk task lain:
- [X] Backend API changes - Tidak perlu, API sudah support `limit` parameter
- [X] Remember user preference - Defer untuk user preferences feature
- [X] Custom limit input - Defer, cukup 4 options dulu
- [X] Persistent limit per user - Defer untuk settings

---

## Next Task

Setelah task ini selesai:
- Lanjut ke **Task 7.2: Create Tenant Form** (form pembuatan tenant baru)

---

## Output Expected

Setelah task selesai, user akan bisa:
1. Melihat dropdown "Rows per page" di tenant list page
2. Memilih 10, 25, 50, atau 100 rows per page
3. Table auto-reload dengan jumlah rows sesuai pilihan
4. Pagination recalculate automatically
5. Experience konsisten dengan halaman users dan tenant detail

**Visual**: Dropdown selector muncul di kiri bawah table, sebelah pagination info, dengan styling yang sama seperti di tenant detail users tab.

---

**Created**: 2026-07-19  
**Sprint**: Week 30-31  
**Phase**: Tenant Module Enhancement  
**Related**: Part of master plan in `.kiro/specs/tenant-module-enhancement.md`
