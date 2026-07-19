# Upload Module Documentation

## Overview

Upload Module menyediakan file upload functionality dengan pluggable storage provider architecture. Mendukung multiple storage backends: Google Drive, AWS S3/MinIO/DigitalOcean Spaces, dan Local Storage.

## Architecture

### Storage Provider Pattern

```
┌─────────────────┐
│ Upload Service  │
└────────┬────────┘
         │
    ┌────▼──────────────┐
    │ Storage Factory   │
    └────┬──────────────┘
         │
    ┌────▼────────────────────────────┐
    │  IStorageProvider Interface     │
    └─────────────────────────────────┘
         │
    ┌────┴──────┬──────────┬──────────┐
    │           │          │          │
┌───▼───┐  ┌───▼───┐  ┌──▼────┐  ┌──▼────┐
│Google │  │  S3   │  │ Local │  │Future │
│ Drive │  │Provider│  │Provider│  │Provs │
└───────┘  └───────┘  └───────┘  └───────┘
```

### Storage Providers

1. **Google Drive Provider**
   - OAuth2 (for Personal Gmail) - RECOMMENDED
   - Service Account (for Google Workspace)
   - Automatic folder management
   - Public URL generation

2. **S3 Provider**
   - AWS S3
   - MinIO
   - DigitalOcean Spaces
   - Any S3-compatible storage

3. **Local Provider**
   - Development/testing only
   - Not recommended for production

## Configuration

### Environment Variables

```bash
# Storage Provider Selection
STORAGE_PROVIDER=google-drive  # google-drive | s3 | local

# File Size Limits (bytes)
MAX_IMAGE_SIZE=5242880         # 5MB
MAX_DOCUMENT_SIZE=10485760     # 10MB
MAX_FILE_SIZE=5242880          # General limit

# Google Drive - OAuth2 (Personal Gmail)
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_DRIVE_MAKE_PUBLIC=true

# Google Drive - Service Account (Google Workspace)
GOOGLE_DRIVE_CREDENTIALS_PATH=./google-drive-credentials.json
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account",...}

# AWS S3 / MinIO / DigitalOcean Spaces
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_S3_ENDPOINT=https://your-endpoint  # For MinIO/Spaces
AWS_S3_PUBLIC_URL=https://your-cdn
AWS_S3_FORCE_PATH_STYLE=false          # true for MinIO
```

### Cross-Platform & Docker Compatibility

**IMPORTANT**: Configuration menggunakan `process.env` langsung di service/provider layer, BUKAN di config factory functions. Ini memastikan kompatibilitas di semua environment:

- ✅ Windows (development)
- ✅ Linux (production)
- ✅ Docker containers
- ✅ Cloud platforms (AWS, GCP, Azure)

**WHY**: NestJS config factory functions execute BEFORE environment variables are fully loaded. Direct `process.env` access di OnModuleInit lifecycle hook ensures env is ready.

## Setup Guide

### Google Drive OAuth2 Setup (Personal Gmail)

1. **Create OAuth Client**
   ```bash
   # Go to: https://console.cloud.google.com/apis/credentials
   # 1. Create OAuth 2.0 Client ID
   # 2. Add redirect URI: http://localhost:3333/oauth2callback
   # 3. Enable Google Drive API
   ```

2. **Run Setup Script**
   ```bash
   cd backend
   node scripts/setup-google-oauth.js
   ```
   
   Script will:
   - Open browser for authentication
   - Save refresh token to `.env`
   - Test connection

3. **Create Application Folder**
   ```bash
   node scripts/create-app-folder.js
   ```
   
   Script will:
   - Create "Platform CMS Uploads" folder in Google Drive
   - Update `GOOGLE_DRIVE_FOLDER_ID` in `.env`
   - Test upload/delete

4. **Verify Setup**
   ```bash
   curl http://localhost:3000/api/upload/test/google-drive
   ```

### AWS S3 / MinIO / DigitalOcean Spaces Setup

1. **Get Credentials**
   - AWS S3: IAM Console → Create User → Access Keys
   - MinIO: MinIO Console → Identity → Users → Access Keys
   - DigitalOcean: Spaces → API → Generate New Key

2. **Create Bucket**
   ```bash
   # AWS S3
   aws s3 mb s3://your-bucket-name
   
   # MinIO
   mc mb your-alias/your-bucket-name
   
   # DigitalOcean: Create via web interface
   ```

3. **Configure .env**
   ```bash
   STORAGE_PROVIDER=s3
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_S3_BUCKET=your-bucket
   
   # For MinIO
   AWS_S3_ENDPOINT=http://localhost:9000
   AWS_S3_FORCE_PATH_STYLE=true
   
   # For DigitalOcean Spaces
   AWS_S3_ENDPOINT=https://sgp1.digitaloceanspaces.com
   AWS_REGION=sgp1
   ```

## API Endpoints

### Upload Image
```bash
POST /api/upload/image
Content-Type: multipart/form-data

# Form data:
# - file: image file (jpg, png, gif, webp, svg)
# - folder: optional subfolder name

# Response:
{
  "success": true,
  "message": "Image berhasil diupload",
  "data": {
    "url": "https://drive.google.com/uc?export=view&id=...",
    "fileId": "file-id",
    "filename": "image.png",
    "size": 12345,
    "mimetype": "image/png",
    "provider": "google-drive"
  }
}
```

### Upload Document
```bash
POST /api/upload/document
Content-Type: multipart/form-data

# Allowed types: pdf, doc, docx, xls, xlsx
```

### Generic Upload
```bash
POST /api/upload
Content-Type: multipart/form-data

# Any file type (within size limit)
```

### Delete File
```bash
DELETE /api/upload/:fileId

# Response:
{
  "success": true,
  "message": "File berhasil dihapus"
}
```

### Get File URL
```bash
GET /api/upload/:fileId/url

# Response:
{
  "success": true,
  "data": {
    "url": "https://..."
  }
}
```

### Get Upload Info
```bash
GET /api/upload/info

# Response:
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

### Test Google Drive Connection
```bash
GET /api/upload/test/google-drive

# Response:
{
  "ready": true,
  "message": "Google Drive siap digunakan",
  "details": {
    "serviceAccount": "user@gmail.com",
    "storageUsed": "10737418240",
    "storageLimit": "429496729600",
    "folder": {
      "id": "folder-id",
      "name": "Platform CMS Uploads",
      "canAddChildren": true
    }
  }
}
```

## File Size Limits

### Default Limits
- Images: 5 MB (5,242,880 bytes)
- Documents: 10 MB (10,485,760 bytes)
- General: 5 MB (5,242,880 bytes)

### Customization
Update `.env`:
```bash
MAX_IMAGE_SIZE=10485760    # 10MB for images
MAX_DOCUMENT_SIZE=20971520  # 20MB for documents
```

### External Provider Limits
- **Google Drive**: 750 GB/day upload quota, 15 GB free storage (or more with paid plan)
- **AWS S3**: No file size limit (multipart for >5GB)
- **MinIO**: Configurable, default no limit
- **DigitalOcean Spaces**: 5 TB/month bandwidth included

## Supported File Types

### Images
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)

### Documents
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)

### Adding More Types
Edit `upload.service.ts`:
```typescript
private readonly allowedImageTypes = [
  'image/jpeg',
  'image/png',
  // Add more...
];
```

## Folder Structure

### Google Drive
```
My Drive/
└── Platform CMS Uploads/  (GOOGLE_DRIVE_FOLDER_ID)
    ├── logo.png
    ├── document.pdf
    └── (future: subfolders support)
```

### S3/MinIO/Spaces
```
bucket-name/
├── logo.png
├── document.pdf
└── (configurable prefixes)
```

### Local Storage
```
backend/
└── uploads/
    ├── images/
    │   └── 1234567890-image.png
    └── documents/
        └── 1234567890-doc.pdf
```

## Scripts

### `setup-google-oauth.js`
OAuth2 setup untuk Personal Gmail. Opens browser, handles callback, saves refresh token.

### `create-app-folder.js`
Creates dedicated "Platform CMS Uploads" folder, tests upload/delete, updates `.env`.

### `test-oauth-upload.js`
Test OAuth2 upload tanpa backend running. Useful untuk debugging credentials.

### `test-storage-config.js`
Debug environment variable loading. Shows all storage-related env vars.

## Error Handling

### Common Errors

**"Google Drive provider belum diinisialisasi"**
- Cause: Missing OAuth credentials atau Service Account
- Fix: Run `setup-google-oauth.js` atau check credentials file

**"File not found: images"**
- Cause: Subfolder "images" doesn't exist in Google Drive
- Fix: Currently subfolder support is disabled. Upload goes to root folder.

**"Upload ke Google Drive gagal: Insufficient Permission"**
- Cause: OAuth token revoked atau folder tidak accessible
- Fix: Re-run `setup-google-oauth.js`

**"Tipe file tidak diizinkan"**
- Cause: File type not in allowed list
- Fix: Check `allowedImageTypes` or `allowedDocumentTypes`

**"Ukuran file melebihi batas"**
- Cause: File size exceeds MAX_IMAGE_SIZE or MAX_DOCUMENT_SIZE
- Fix: Increase limit in `.env` or compress file

## Security Considerations

### Credentials
- **NEVER commit `.env` to git** (already in `.gitignore`)
- OAuth refresh tokens are long-lived - keep secure
- Service Account JSON files contain private keys - treat as passwords
- Use environment variables in production, not files

### File Access
- Google Drive files set to "anyone with link can view" by default
- Change `GOOGLE_DRIVE_MAKE_PUBLIC=false` for private files
- S3 buckets should have proper IAM policies
- Local storage not suitable for production

### Validation
- File type validation (whitelist, not blacklist)
- File size limits enforced
- Filename sanitization (remove special chars)
- No execution of uploaded files

## Performance

### Upload Speed
- Google Drive: ~5-10 MB/s (depends on network)
- AWS S3: ~20-50 MB/s (depends on region)
- MinIO: LAN speed (100+ MB/s)
- Local: Disk speed (100+ MB/s)

### Optimization Tips
- Use CDN for S3 (CloudFront, DigitalOcean CDN)
- Enable compression for documents
- Consider image optimization service (e.g., ImageKit, Cloudinary)
- Use multipart upload for large files

## Troubleshooting

### Debug Logs
Enable detailed logging:
```typescript
// In google-drive.provider.ts or s3.provider.ts
this.logger.debug(`Uploading ${options.originalname}...`);
```

### Test Providers Individually
```bash
# Google Drive
curl http://localhost:3000/api/upload/test/google-drive

# Check environment
node scripts/test-storage-config.js
```

### Reset OAuth
```bash
# Delete refresh token from .env
# Re-run setup
node scripts/setup-google-oauth.js
```

## Future Enhancements

### Planned Features
- [ ] Subfolder support (automatic creation)
- [ ] Image resizing/optimization
- [ ] CDN integration
- [ ] Upload progress tracking
- [ ] Batch upload/delete
- [ ] File metadata storage (database)
- [ ] Access control per file
- [ ] Temporary upload URLs
- [ ] Admin UI for storage settings

### Provider Roadmap
- [ ] Azure Blob Storage
- [ ] Cloudflare R2
- [ ] Backblaze B2
- [ ] IPFS (decentralized)

## References

- [Google Drive API](https://developers.google.com/drive)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MinIO Documentation](https://min.io/docs/)
- [DigitalOcean Spaces](https://docs.digitalocean.com/products/spaces/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
