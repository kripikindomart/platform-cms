# Schema Backup Feature

## Overview
Fitur backup schema otomatis untuk tenant yang dihapus permanen (hard delete), dengan retention 15 hari sebelum dihapus otomatis.

## Features

### 1. **Automatic Schema Backup on Hard Delete**
- Saat hard delete tenant, schema database di-backup secara otomatis (default)
- User dapat memilih untuk tidak backup schema (langsung hapus permanen)
- Schema backup mencatat metadata: size, table count, tenant info

### 2. **15-Day Retention Policy**
- Schema backup disimpan selama **15 hari**
- Setelah 15 hari, schema akan dihapus otomatis oleh cleanup job
- User dapat menghapus backup lebih awal jika diperlukan

### 3. **Schema Backups Tab**
- Tab baru di UI untuk melihat semua schema backup
- Menampilkan informasi: tenant name, schema name, size, table count, expiry date
- Visual indicator untuk backup yang akan expired (< 3 hari)

### 4. **Manual Cleanup**
- User dengan permission dapat menghapus schema backup kapan saja
- Konfirmasi diperlukan sebelum menghapus
- Schema langsung di-drop dari database saat dihapus

## Database Schema

### Table: `tenant_schema_backups`

```sql
CREATE TABLE public.tenant_schema_backups (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  tenant_slug VARCHAR(255) NOT NULL,
  schema_name VARCHAR(255) NOT NULL UNIQUE,
  backup_reason VARCHAR(100) DEFAULT 'tenant_hard_delete',
  backup_size VARCHAR(50),
  table_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES public.users(id),
  restored_at TIMESTAMP WITH TIME ZONE,
  restored_by BIGINT REFERENCES public.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by BIGINT REFERENCES public.users(id),
  metadata JSONB
);
```

## API Endpoints

### 1. Hard Delete Tenant (with backup option)
```
DELETE /api/tenants/:id/hard?backupSchema=true
```

**Query Parameters:**
- `backupSchema` (boolean, default: `true`)
  - `true`: Backup schema sebelum delete tenant record
  - `false`: Hapus schema langsung tanpa backup

**Response:**
```json
{
  "success": true,
  "message": "Tenant berhasil dihapus permanen, schema telah di-backup (15 hari)",
  "backup_created": true
}
```

### 2. Get Schema Backups
```
GET /api/tenants/schema-backups
```

**Response:**
```json
[
  {
    "id": 1,
    "tenant_id": 123,
    "tenant_name": "Acme Corp",
    "tenant_slug": "acme-corp",
    "schema_name": "tenant_xyz123",
    "backup_size": "45.2 MB",
    "table_count": 11,
    "expires_at": "2024-02-15T10:30:00Z",
    "created_at": "2024-01-31T10:30:00Z",
    "days_remaining": 12,
    "is_expired": false
  }
]
```

### 3. Delete Schema Backup
```
DELETE /api/tenants/schema-backups/:backupId
```

**Response:**
```json
{
  "success": true,
  "message": "Schema backup berhasil dihapus permanen"
}
```

## Frontend Implementation

### Hard Delete Dialog

Dialog hard delete sekarang memiliki checkbox untuk backup schema:

```tsx
<Checkbox
  id="backup-schema"
  checked={backupSchema}
  onCheckedChange={(checked) => setBackupSchema(checked as boolean)}
/>
<label htmlFor="backup-schema">
  Backup schema database (Rekomendasi)
</label>
```

**Pesan berdasarkan pilihan:**
- ✅ **Backup enabled**: "Schema akan di-backup selama 15 hari"
- ⚠️ **Backup disabled**: "Schema akan dihapus permanen selamanya!"

### Schema Backups Tab

Tab baru menampilkan:
- Tenant info (name, ID)
- Schema name (monospace font)
- Size dan jumlah tables
- Backup date
- Expiry countdown dengan color coding:
  - 🟢 Green: > 3 days remaining
  - 🟠 Orange: ≤ 3 days remaining  
  - 🔴 Red: Expired

### Actions
- **Delete Now**: Hapus schema backup sebelum expired
- **Refresh**: Reload daftar schema backups

## Backend Services

### TenantsService

#### `hardDelete(id, userId, backupSchema)`
Menghapus tenant permanen dengan opsi backup schema.

**Logic:**
1. Check tenant exists
2. If `backupSchema = true`:
   - Get schema info (size, table count)
   - Create backup record dengan `expires_at = now() + 15 days`
   - Keep schema intact
3. If `backupSchema = false`:
   - Drop schema immediately dengan CASCADE
4. Hard delete tenant record

#### `getSchemaBackups()`
Mengambil semua schema backup yang aktif dengan calculated `days_remaining`.

#### `deleteSchemaBackup(backupId, userId)`
Menghapus schema backup:
1. Drop schema dengan CASCADE
2. Delete backup record dari database

#### `cleanupExpiredSchemaBackups()` (Cron Job)
Background job untuk cleanup otomatis:
- Mencari backup yang expired (`expires_at < now()`)
- Drop schema dan delete record
- Return summary: `{ deleted, failed }`

## Cron Job Setup (TODO)

Tambahkan cron job di `@nestjs/schedule`:

```typescript
@Cron('0 2 * * *') // Run at 2 AM daily
async handleSchemaBackupCleanup() {
  const result = await this.tenantsService.cleanupExpiredSchemaBackups();
  this.logger.log(`Schema cleanup: ${result.deleted} deleted, ${result.failed} failed`);
}
```

## Security & Permissions

Required permission: `ability.can('delete', 'tenants')`

**Actions requiring permission:**
- Hard delete tenant
- View schema backups
- Delete schema backup

## User Experience Flow

### Scenario 1: Hard Delete dengan Backup (Default)
1. User pilih "Hapus Permanen" dari trash
2. Dialog muncul dengan checkbox "Backup schema" ✅ (checked)
3. User konfirmasi → Tenant dihapus, schema di-backup
4. Toast success: "Schema di-backup, akan dihapus otomatis dalam 15 hari"
5. Schema muncul di tab "Schema Backups"

### Scenario 2: Hard Delete tanpa Backup
1. User uncheck checkbox "Backup schema" ❌
2. Warning berubah: "Schema akan dihapus permanen!"
3. User konfirmasi → Tenant DAN schema dihapus langsung
4. Toast success: "Tenant dan schema berhasil dihapus permanen"
5. Tidak ada backup dibuat

### Scenario 3: Manual Delete Schema Backup
1. User buka tab "Schema Backups"
2. Klik "Delete Now" pada backup tertentu
3. Konfirmasi browser: "Hapus schema [name]?"
4. Schema di-drop dari database, backup record dihapus
5. Toast success dengan feedback

### Scenario 4: Auto Cleanup (15 Days)
1. Backup created dengan `expires_at = now() + 15 days`
2. Cron job berjalan setiap hari
3. Saat backup expired, otomatis:
   - Drop schema CASCADE
   - Delete backup record
4. User tidak perlu manual action

## Migration

Run migration untuk create table:

```bash
# Production
npm run migration:run

# Or manual SQL
psql $DATABASE_URL -f migrations/create-tenant-schema-backups-table.sql
```

## Testing Checklist

- [ ] Hard delete dengan backup schema (default)
- [ ] Hard delete tanpa backup schema
- [ ] Schema backups tab load data
- [ ] Manual delete schema backup
- [ ] Expiry countdown display correct
- [ ] Color coding berdasarkan days remaining
- [ ] Toast messages appropriate
- [ ] Permissions enforced
- [ ] Cron job cleanup expired backups
- [ ] Empty state UI (no backups)
- [ ] Error handling

## Future Enhancements

1. **Schema Restore**: Restore tenant dari schema backup
2. **Export Backup**: Download schema dump sebagai SQL file
3. **Retention Configuration**: Admin bisa set retention period (default 15 hari)
4. **Backup Notification**: Email notification sebelum backup expired
5. **Backup Size Limit**: Set max size untuk auto-backup
6. **Manual Backup**: Backup schema tanpa delete tenant

## Notes

- Schema name format: `tenant_[slug]` (26 chars alphanumeric)
- Schema drop menggunakan `CASCADE` untuk hapus semua objects
- Metadata JSONB bisa store additional info untuk restore
- Soft delete tenant TIDAK membuat backup (only hard delete)
