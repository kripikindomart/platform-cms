# Setup Google Drive Upload

Panduan lengkap untuk mengkonfigurasi Google Drive sebagai storage provider.

## [OK] Arsitektur Storage Provider

Sistem ini menggunakan **Storage Provider Pattern** yang memungkinkan switching antara berbagai storage:
- **Google Drive** - Upload ke Google Drive pribadi (400GB+)
- **AWS S3** - Amazon S3 atau S3-compatible (MinIO, DigitalOcean Spaces)
- **Local** - Filesystem lokal (development/fallback)

Provider dipilih via environment variable `STORAGE_PROVIDER`.

## [OK] Langkah Setup Google Drive

### 1. Buat Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project atau pilih project existing
3. Nama project: misal "Platform CMS Storage"

### 2. Enable Google Drive API

1. Di Google Cloud Console, buka **APIs & Services** > **Library**
2. Cari "Google Drive API"
3. Klik **Enable**

### 3. Create Service Account

1. Buka **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **Service Account**
3. Isi informasi:
   - **Service account name**: `platform-cms-storage`
   - **Service account ID**: auto-generated
   - **Description**: `Service account untuk upload files ke Google Drive`
4. Klik **Create and Continue**
5. Skip "Grant this service account access to project" (optional)
6. Klik **Done**

### 4. Download Service Account Key (JSON)

1. Di halaman **Credentials**, klik service account yang baru dibuat
2. Buka tab **Keys**
3. Klik **Add Key** > **Create new key**
4. Pilih format **JSON**
5. Klik **Create**
6. File JSON akan otomatis terdownload - **SIMPAN FILE INI DENGAN AMAN!**

Format JSON key:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n",
  "client_email": "platform-cms-storage@your-project.iam.gserviceaccount.com",
  "client_id": "xxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### 5. Share Google Drive Folder

1. Buka [Google Drive](https://drive.google.com/)
2. Buat folder baru untuk menyimpan uploads, misal: `Platform CMS Uploads`
3. Klik kanan folder > **Share**
4. Copy **client_email** dari JSON key (langkah 4)
5. Paste email service account dan berikan akses **Editor**
6. Klik **Share**
7. Copy **Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### 6. Konfigurasi Backend

Edit file `.env`:

```bash
# Storage Provider
STORAGE_PROVIDER=google-drive

# Google Drive Configuration
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account","project_id":"xxx",...}
GOOGLE_DRIVE_FOLDER_ID=YOUR_FOLDER_ID_HERE
```

**PENTING:**
- `GOOGLE_DRIVE_CREDENTIALS` harus **single line** JSON (hapus semua newline)
- Atau gunakan tool seperti [JSON minifier](https://www.cleancss.com/json-minify/)

### 7. Test Upload

```bash
# Start backend
npm run start:dev

# Test via curl
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@path/to/image.jpg" \
  -F "folder=test"
```

Response:
```json
{
  "success": true,
  "message": "Image berhasil diupload",
  "data": {
    "url": "https://drive.google.com/uc?export=view&id=FILE_ID",
    "fileId": "FILE_ID",
    "filename": "image.jpg",
    "size": 12345,
    "mimetype": "image/jpeg",
    "provider": "google-drive"
  }
}
```

## [OK] Switching Storage Provider

### Gunakan Local Storage (Development)

```bash
STORAGE_PROVIDER=local
UPLOAD_DEST=./uploads
```

### Gunakan AWS S3

```bash
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

### Gunakan MinIO / DigitalOcean Spaces

```bash
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
AWS_S3_PUBLIC_URL=https://your-bucket.nyc3.digitaloceanspaces.com
```

## [OK] API Endpoints

### Upload Image
```http
POST /api/upload/image
Content-Type: multipart/form-data

file: [File]
folder: string (optional)
provider: string (optional: 'google-drive' | 's3' | 'local')
```

### Upload Document
```http
POST /api/upload/document
Content-Type: multipart/form-data

file: [File]
folder: string (optional)
provider: string (optional)
```

### Upload Any File
```http
POST /api/upload
Content-Type: multipart/form-data

file: [File]
folder: string (optional)
provider: string (optional)
```

### Delete File
```http
DELETE /api/upload/:fileId?provider=google-drive
```

### Get Storage Info
```http
GET /api/upload/info
```

Response:
```json
{
  "success": true,
  "data": {
    "defaultProvider": "google-drive",
    "availableProviders": ["google-drive", "s3", "local"],
    "maxImageSize": 5242880,
    "maxDocumentSize": 10485760,
    "allowedImageTypes": ["image/jpeg", "image/png", ...],
    "allowedDocumentTypes": ["application/pdf", ...]
  }
}
```

## [OK] Troubleshooting

### Error: "Google Drive provider belum diinisialisasi"
- Pastikan `GOOGLE_DRIVE_CREDENTIALS` sudah diset di `.env`
- Pastikan JSON valid (tanpa newline, escaped dengan benar)
- Restart backend server

### Error: "Insufficient Permission"
- Pastikan service account email sudah di-share ke folder Drive
- Pastikan akses level minimal **Editor**
- Pastikan Google Drive API sudah enabled

### Error: "File not found" saat delete
- Pastikan fileId benar
- Pastikan file belum dihapus manual dari Drive
- Check folder permissions

### File tidak muncul di Drive
- Check folder ID benar
- Check service account email sudah di-share
- Reload halaman Google Drive (bisa ada delay 1-2 detik)

## [OK] Best Practices

1. **Jangan commit credentials** ke git
2. Gunakan `.env` untuk credentials (sudah di `.gitignore`)
3. Buat folder terpisah per environment (dev/staging/prod)
4. Set quota limits di Google Cloud Console
5. Monitor usage via Google Cloud Console
6. Gunakan local storage untuk development/testing
7. Backup folder ID dan service account key

## [OK] Keamanan

1. **Service Account Key** adalah credentials sensitif:
   - Simpan dengan aman (password manager, secrets manager)
   - Jangan share atau commit ke repository
   - Rotate key secara berkala (3-6 bulan)

2. **Folder Permissions**:
   - Hanya share dengan service account (jangan public)
   - Gunakan folder terpisah per tenant jika multi-tenant
   - Review permissions secara berkala

3. **File Validation**:
   - Backend sudah validasi file type dan size
   - Customize limits di `upload.service.ts`
   - Consider virus scanning untuk production

## [OK] Migrasi Provider

Jika ingin migrasi dari Google Drive ke S3 (atau sebaliknya):

1. Backup URL lama dari database
2. Update `.env`: `STORAGE_PROVIDER=s3`
3. Files lama masih accessible via URL lama
4. Upload baru akan ke provider baru
5. Optional: migrate files secara bertahap dengan script

## [OK] Monitoring

Check logs untuk tracking uploads:
```bash
# Backend logs
npm run start:dev

# Look for:
[UploadService] Image uploaded: filename.jpg via google-drive
[GoogleDriveProvider] File uploaded ke Google Drive: filename.jpg (FILE_ID)
```

Check Google Cloud Console:
- **APIs & Services** > **Dashboard** - API usage
- **IAM & Admin** > **Service Accounts** - Service account activity

## [OK] Quota & Limits

**Google Drive:**
- Storage: Sesuai akun Google (15GB free, unlimited jika Workspace)
- Upload size: 5TB per file (API limit)
- Rate limit: 1000 requests per 100 seconds

**Backend Limits** (configurable di `upload.service.ts`):
- Image: 5MB max
- Document: 10MB max

Untuk mengubah limits, edit `upload.service.ts`:
```typescript
private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
private readonly MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB
```
