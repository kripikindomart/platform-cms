## Task 8.1: Upload Settings Module - Dynamic URL Format Management

**Sprint**: Week 8 - Upload Enhancement
**Priority**: P1
**Estimated Time**: 6 hours
**Dependencies**: Upload module (existing)
**Status**: [PENDING] BELUM DIMULAI

---

## Objective

Membuat module settings untuk mengatur format URL Google Drive secara dinamis berdasarkan tipe file yang diupload. Module ini memungkinkan admin untuk configure URL format (direct view, thumbnail, download, embed) per kategori file (images, documents, videos) sehingga sistem dapat otomatis memilih URL format yang optimal.

---

## Goals

1. Membuat enum untuk Google Drive URL format types
2. Implementasi auto-classification logic berdasarkan mimetype
3. Membuat settings storage untuk URL format configuration
4. Membuat API endpoints untuk manage upload settings
5. Membuat UI untuk configure upload settings (Settings page)
6. Apply settings ke upload service untuk generate URL yang sesuai

---

## Deliverables

### 1. Backend - URL Format Enum & Classification Logic
**File**: `backend/src/modules/upload/enums/url-format.enum.ts` (new)

**What to build**:
- [SELESAI] Define GoogleDriveUrlFormat enum dengan 4 format types
- [ ] Create UrlFormatHelper class untuk generate URL berdasarkan format
- [ ] Create FileTypeClassifier untuk auto-detect category dari mimetype

**Code example**:
```typescript
export enum GoogleDriveUrlFormat {
  DIRECT_VIEW = 'direct_view',        // https://lh3.googleusercontent.com/d/{id}
  THUMBNAIL = 'thumbnail',             // https://drive.google.com/thumbnail?id={id}&sz=w{size}
  DOWNLOAD = 'download',               // https://drive.google.com/uc?id={id}&export=download
  EMBED_VIEW = 'embed_view',           // https://drive.google.com/file/d/{id}/preview
}

export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

export class UrlFormatHelper {
  static generateUrl(fileId: string, format: GoogleDriveUrlFormat, options?: { size?: number }): string {
    switch (format) {
      case GoogleDriveUrlFormat.DIRECT_VIEW:
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      case GoogleDriveUrlFormat.THUMBNAIL:
        const size = options?.size || 200;
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
      case GoogleDriveUrlFormat.DOWNLOAD:
        return `https://drive.google.com/uc?id=${fileId}&export=download`;
      case GoogleDriveUrlFormat.EMBED_VIEW:
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
}

export class FileTypeClassifier {
  private static readonly IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  private static readonly DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  private static readonly VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  
  static classify(mimetype: string): FileCategory {
    if (this.IMAGE_TYPES.includes(mimetype) || mimetype.startsWith('image/')) {
      return FileCategory.IMAGE;
    }
    if (this.DOCUMENT_TYPES.includes(mimetype) || mimetype.startsWith('application/')) {
      return FileCategory.DOCUMENT;
    }
    if (this.VIDEO_TYPES.includes(mimetype) || mimetype.startsWith('video/')) {
      return FileCategory.VIDEO;
    }
    if (mimetype.startsWith('audio/')) {
      return FileCategory.AUDIO;
    }
    return FileCategory.OTHER;
  }
}
```

### 2. Backend - Upload Settings Entity & Migration
**Method**: Use CLI generator untuk base, then enhance

**Step 1 - Generate dengan CLI**:
```bash
cd cli
node bin/cms.js generate crud upload-settings \
  --fields="category:string:50,url_format:string:50,thumbnail_size:int,is_active:boolean" \
  --tenant --soft-delete --audit
```

**Step 2 - Enhance Entity**:
**File**: `backend/src/database/schema/tenant/upload-settings.schema.ts`

**Modifications needed**:
- [ ] Add enum constraint untuk category field
- [ ] Add enum constraint untuk url_format field
- [ ] Add default values
- [ ] Add unique constraint (tenant + category)

**Enhanced schema**:
```typescript
export const uploadSettings = pgTable('upload_settings', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // File category (unique per tenant)
  category: varchar('category', { length: 50 }).notNull(), // FileCategory enum
  
  // URL format to use
  url_format: varchar('url_format', { length: 50 }).notNull(), // GoogleDriveUrlFormat enum
  
  // Options
  thumbnail_size: integer('thumbnail_size').default(200), // For THUMBNAIL format
  is_active: boolean('is_active').notNull().default(true),
  
  // Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

// Add unique index
export const uploadSettingsIndex = pgIndex('upload_settings_tenant_category_unique')
  .on(uploadSettings.category)
  .where(isNull(uploadSettings.deleted_at));
```

**Step 3 - Run DB sync**:
```bash
cd backend
npm run db:push  # Development - instant sync
# OR
npm run db:generate  # Production - creates migration file
npm run db:migrate
```

### 3. Backend - Upload Settings Repository & Service
**Files**: Auto-generated by CLI, need enhancements

**File**: `backend/src/modules/upload-settings/upload-settings.repository.ts`

**Additional methods needed**:
- [ ] `findByCategory(category: FileCategory): Promise<UploadSetting | null>`
- [ ] `getDefaultFormat(category: FileCategory): Promise<GoogleDriveUrlFormat>`
- [ ] `upsertSetting(category, format, options): Promise<UploadSetting>`

**File**: `backend/src/modules/upload-settings/upload-settings.service.ts`

**Business logic needed**:
- [ ] Validate enum values (category & url_format)
- [ ] Seed default settings jika tidak ada
- [ ] Cache settings untuk performa
- [ ] Method `getFormatForFile(mimetype: string): Promise<GoogleDriveUrlFormat>`

**Code example**:
```typescript
@Injectable()
export class UploadSettingsService {
  private settingsCache: Map<FileCategory, GoogleDriveUrlFormat> = new Map();
  
  async getFormatForFile(mimetype: string): Promise<GoogleDriveUrlFormat> {
    const category = FileTypeClassifier.classify(mimetype);
    
    // Check cache
    if (this.settingsCache.has(category)) {
      return this.settingsCache.get(category);
    }
    
    // Get from database
    const setting = await this.repository.findByCategory(category);
    
    if (setting && setting.is_active) {
      this.settingsCache.set(category, setting.url_format as GoogleDriveUrlFormat);
      return setting.url_format as GoogleDriveUrlFormat;
    }
    
    // Fallback to defaults
    return this.getDefaultFormat(category);
  }
  
  private getDefaultFormat(category: FileCategory): GoogleDriveUrlFormat {
    switch (category) {
      case FileCategory.IMAGE:
        return GoogleDriveUrlFormat.DIRECT_VIEW;
      case FileCategory.DOCUMENT:
        return GoogleDriveUrlFormat.DOWNLOAD;
      case FileCategory.VIDEO:
      case FileCategory.AUDIO:
        return GoogleDriveUrlFormat.EMBED_VIEW;
      default:
        return GoogleDriveUrlFormat.DOWNLOAD;
    }
  }
  
  async seedDefaultSettings(): Promise<void> {
    const defaults = [
      { category: FileCategory.IMAGE, url_format: GoogleDriveUrlFormat.DIRECT_VIEW },
      { category: FileCategory.DOCUMENT, url_format: GoogleDriveUrlFormat.DOWNLOAD },
      { category: FileCategory.VIDEO, url_format: GoogleDriveUrlFormat.EMBED_VIEW },
      { category: FileCategory.AUDIO, url_format: GoogleDriveUrlFormat.EMBED_VIEW },
      { category: FileCategory.OTHER, url_format: GoogleDriveUrlFormat.DOWNLOAD },
    ];
    
    for (const setting of defaults) {
      await this.repository.upsertSetting(setting.category, setting.url_format);
    }
  }
}
```

### 4. Backend - Update Google Drive Provider
**File**: `backend/src/modules/upload/providers/google-drive.provider.ts`

**Changes needed**:
- [ ] Inject UploadSettingsService
- [ ] Di method `upload()`, setelah file uploaded:
  - Classify file type dari mimetype
  - Get URL format dari settings
  - Generate URL dengan format yang sesuai
  - Return URL dan metadata

**Code changes**:
```typescript
@Injectable()
export class GoogleDriveProvider implements IStorageProvider {
  constructor(
    private configService: ConfigService,
    private uploadSettingsService: UploadSettingsService, // NEW
  ) {}
  
  async upload(options: UploadOptions): Promise<UploadResult> {
    // ... existing upload logic ...
    
    // NEW: Get URL format based on file type
    const urlFormat = await this.uploadSettingsService.getFormatForFile(options.mimetype);
    
    // Generate URL with appropriate format
    const publicUrl = UrlFormatHelper.generateUrl(file.id, urlFormat);
    
    return {
      url: publicUrl,
      fileId: file.id,
      filename: file.name,
      size: parseInt(file.size || '0'),
      mimetype: file.mimeType,
      provider: this.getName(),
      metadata: {
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        originalName: options.originalname,
        urlFormat: urlFormat, // NEW: include format used
        fileCategory: FileTypeClassifier.classify(options.mimetype), // NEW
      },
    };
  }
}
```

### 5. Backend - API Controller & DTOs
**Files**: Auto-generated by CLI

**File**: `backend/src/modules/upload-settings/upload-settings.controller.ts`

**Endpoints needed** (CLI generates standard CRUD):
- `GET /api/upload-settings` - List all settings
- `GET /api/upload-settings/:id` - Get single setting
- `POST /api/upload-settings` - Create setting
- `PATCH /api/upload-settings/:id` - Update setting
- `DELETE /api/upload-settings/:id` - Soft delete

**Additional endpoints to add manually**:
- [ ] `POST /api/upload-settings/seed-defaults` - Seed default settings
- [ ] `GET /api/upload-settings/by-category/:category` - Get by category
- [ ] `POST /api/upload-settings/test-url` - Test URL generation

**DTOs** (enhance CLI-generated):
**File**: `backend/src/modules/upload-settings/dto/create-upload-setting.dto.ts`
```typescript
export class CreateUploadSettingDto {
  @IsEnum(FileCategory)
  @IsNotEmpty()
  category: FileCategory;
  
  @IsEnum(GoogleDriveUrlFormat)
  @IsNotEmpty()
  url_format: GoogleDriveUrlFormat;
  
  @IsInt()
  @Min(100)
  @Max(2000)
  @IsOptional()
  thumbnail_size?: number;
  
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
```

### 6. Frontend - Upload Settings Page
**Method**: Use CLI generator untuk base structure, then customize UI

**Step 1 - CLI generates base page**:
```bash
# CLI should generate:
# - frontend/app/(private)/org/[tenant]/portal/upload-settings/page.tsx
# - frontend/lib/api/services/upload-settings.service.ts
```

**Step 2 - Customize UI**:
**File**: `frontend/app/(private)/org/[tenant]/portal/upload-settings/page.tsx`

**UI Requirements**:
- [ ] List semua file categories dalam cards
- [ ] Each card shows: category name, current URL format, status
- [ ] Edit button per card → open modal/dialog
- [ ] Modal contains: 
  - Dropdown untuk select URL format
  - Number input untuk thumbnail size (only if THUMBNAIL format)
  - Preview example URL
  - Toggle untuk is_active
- [ ] Save button → API call → refresh list
- [ ] Test URL button → generate sample URL

**Design reference**:
```tsx
export default function UploadSettingsPage() {
  const { data: settings, isLoading, refetch } = useUploadSettings();
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Upload Settings"
        description="Konfigurasi format URL untuk berbagai tipe file"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings?.map(setting => (
          <Card key={setting.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3>{setting.category}</h3>
                <Badge variant={setting.is_active ? 'success' : 'secondary'}>
                  {setting.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label>URL Format</Label>
                  <p className="text-sm text-neutral-600">{setting.url_format}</p>
                </div>
                
                {setting.url_format === 'thumbnail' && (
                  <div>
                    <Label>Thumbnail Size</Label>
                    <p className="text-sm text-neutral-600">{setting.thumbnail_size}px</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button size="sm" onClick={() => openEditModal(setting)}>
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Edit Modal */}
      <EditUploadSettingModal 
        open={showEditModal}
        setting={selectedSetting}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}
```

### 7. Frontend - API Service
**File**: `frontend/lib/api/services/upload-settings.service.ts` (CLI-generated, enhance)

**Additional methods**:
- [ ] `testUrl(category, format): Promise<string>` - Test URL generation
- [ ] `seedDefaults(): Promise<void>` - Call seed endpoint

### 8. Seed Script & Migration
**File**: `backend/scripts/seed-upload-settings.js`

**What to build**:
- [ ] Script untuk seed default upload settings ke semua tenant
- [ ] Run automatically saat db:push atau db:migrate

```javascript
async function seedUploadSettings() {
  const tenants = await db.select().from(tenants);
  
  for (const tenant of tenants) {
    // Switch to tenant schema
    const schema = getTenantSchema(tenant.slug);
    
    // Seed defaults
    await uploadSettingsService.seedDefaultSettings();
    
    console.log(`[OK] Seeded upload settings for tenant: ${tenant.slug}`);
  }
}
```

---

## Acceptance Criteria

### Backend:
- [ ] GoogleDriveUrlFormat enum dengan 4 format types
- [ ] FileTypeClassifier dapat classify mimetype dengan benar
- [ ] UrlFormatHelper generate URL sesuai format
- [ ] Upload settings table exists dengan proper schema
- [ ] CRUD API endpoints working (list, create, update, delete)
- [ ] Additional endpoints (seed, by-category, test-url) working
- [ ] Google Drive provider menggunakan settings untuk generate URL
- [ ] Default settings ter-seed otomatis untuk setiap tenant

### Frontend:
- [ ] Upload settings page menampilkan semua categories
- [ ] Edit modal berfungsi dengan baik
- [ ] URL format dropdown populated dengan enum values
- [ ] Thumbnail size input hanya muncul untuk THUMBNAIL format
- [ ] Preview URL ditampilkan saat edit
- [ ] Save functionality working
- [ ] Badge status (aktif/nonaktif) accurate

### Integration:
- [ ] Upload image → URL format = DIRECT_VIEW
- [ ] Upload document → URL format = DOWNLOAD
- [ ] Upload video → URL format = EMBED_VIEW
- [ ] Settings changes immediately affect new uploads
- [ ] URL generated accessible tanpa auth error

---

## Testing Checklist

### Test 1: CLI Generation
```bash
cd cli
node bin/cms.js generate crud upload-settings \
  --fields="category:string:50,url_format:string:50,thumbnail_size:int,is_active:boolean" \
  --tenant --soft-delete --audit
```
**Expected**: Module files generated di backend & frontend

### Test 2: DB Sync
```bash
cd backend
npm run db:push
```
**Expected**: Table `upload_settings` created di tenant schemas

### Test 3: Seed Defaults
```bash
node scripts/seed-upload-settings.js
```
**Expected**: 5 default settings created (IMAGE, DOCUMENT, VIDEO, AUDIO, OTHER)

### Test 4: API Test - Get Settings
```bash
curl http://localhost:3000/api/upload-settings \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-Slug: tenant_1"
```
**Expected**: Array of 5 settings

### Test 5: API Test - Update Setting
```bash
curl -X PATCH http://localhost:3000/api/upload-settings/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-Slug: tenant_1" \
  -d '{"url_format":"thumbnail","thumbnail_size":500}'
```
**Expected**: Setting updated, response contains new values

### Test 6: Upload Image Test
```bash
# Upload image through existing upload endpoint
# Check response.data.metadata.urlFormat = "direct_view"
# Check response.data.url starts with "https://lh3.googleusercontent.com/d/"
```
**Expected**: Image URL uses DIRECT_VIEW format

### Test 7: Upload Document Test
```bash
# Upload PDF
# Check response.data.metadata.urlFormat = "download"
# Check response.data.url contains "export=download"
```
**Expected**: Document URL uses DOWNLOAD format

### Test 8: Frontend Settings Page
```
1. Navigate to /portal/upload-settings
2. See 5 cards (IMAGE, DOCUMENT, VIDEO, AUDIO, OTHER)
3. Click "Edit" on IMAGE card
4. Change format to THUMBNAIL
5. Set size to 800
6. Save
7. Verify card updated
```
**Expected**: Settings page fully functional

### Test 9: Type Check & Lint
```bash
cd backend && npm run type-check && npm run lint
cd frontend && npm run type-check && npm run lint
```
**Expected**: All pass

### Test 10: Build
```bash
cd backend && npm run build
cd frontend && npm run build
```
**Expected**: Build successful

---

## Files to Create/Modify

### Backend - New Files:
1. `backend/src/modules/upload/enums/url-format.enum.ts` - Enum & helpers
2. `backend/src/modules/upload-settings/` - Full CRUD module (CLI-generated)
3. `backend/scripts/seed-upload-settings.js` - Seed script
4. `backend/migrations/permissions/upload-settings-permissions.sql` - Permissions

### Backend - Modify:
1. `backend/src/modules/upload/providers/google-drive.provider.ts` - Integrate settings
2. `backend/src/modules/upload/upload.module.ts` - Import UploadSettingsModule
3. `backend/src/app.module.ts` - Register UploadSettingsModule (CLI does this)

### Frontend - New Files:
1. `frontend/app/(private)/org/[tenant]/portal/upload-settings/page.tsx` - Settings page
2. `frontend/lib/api/services/upload-settings.service.ts` - API service

### Frontend - Modify:
1. `frontend/lib/api/services/upload.service.ts` - Add metadata types

---

## Common Pitfalls

### 1. Enum Validation
[X] **Wrong**: Store enum as plain string
```typescript
category: varchar('category', { length: 50 })
```

[OK] **Correct**: Add check constraint (do in migration)
```sql
ALTER TABLE upload_settings 
ADD CONSTRAINT check_category 
CHECK (category IN ('image', 'document', 'video', 'audio', 'other'));
```

### 2. Cache Invalidation
**Problem**: Settings changed tapi masih pakai cached value

**Solution**: Implement cache invalidation
```typescript
async updateSetting(id: number, dto: UpdateDto): Promise<Setting> {
  const updated = await this.repository.update(id, dto);
  
  // Clear cache
  this.settingsCache.delete(updated.category);
  
  return updated;
}
```

### 3. Default Settings Missing
**Problem**: Tenant baru tidak punya settings

**Solution**: Hook ke tenant creation
```typescript
// In TenantsService.createTenant()
await this.uploadSettingsService.seedDefaultSettings();
```

---

## Documentation References

- `backend/docs/UPLOAD_MODULE.md` - Current upload implementation
- `.kiro/skills/platform-cms-rules.md` Section 2.2 - Service patterns
- `.kiro/skills/cli-commands.md` - CLI usage guide
- Google Drive API - URL formats documentation

---

## Success Criteria

**DONE when**:
- [ ] CLI generated base module successfully
- [ ] All enums & helpers implemented
- [ ] Database schema created & seeded
- [ ] CRUD API working untuk all endpoints
- [ ] Google Drive provider menggunakan settings
- [ ] Frontend settings page fully functional
- [ ] All tests pass (type-check, lint, build)
- [ ] Manual testing complete (upload test untuk semua categories)
- [ ] Documentation updated (API-CONTRACT.md)
- [ ] Git commit created dengan proper message
- [ ] GitHub issue closed dengan verification

---

## Notes for Implementation

**Time Estimate Breakdown**:
- CLI generation & DB setup: 1h
- Backend enums & helpers: 1h
- Backend service logic & integration: 2h
- Frontend settings page: 1.5h
- Testing & bug fixes: 0.5h

**Implementation Order**:
1. Run CLI generator untuk base structure
2. Implement enums & helper classes
3. Enhance repository & service with business logic
4. Update Google Drive provider
5. Customize frontend UI
6. Seed defaults
7. Test integration end-to-end

**Testing Priority**:
1. Test URL generation untuk each format FIRST
2. Test file classification by mimetype
3. Test settings CRUD operations
4. Test integration dengan upload flow
5. Test frontend UI interactions

**What NOT to implement** (defer to later):
- [X] S3 provider support - Phase N (only Google Drive for now)
- [X] Advanced caching (Redis) - use in-memory Map first
- [X] File type custom mapping UI - use defaults first
- [X] Bulk update settings - single update sufficient

---

**Created**: 2026-07-22
**Sprint**: Week 8
**Phase**: Upload Enhancement
**Related Issues**: None
**Module Type**: Settings & Configuration
**Complexity**: Medium-High (requires CLI + manual enhancements)
