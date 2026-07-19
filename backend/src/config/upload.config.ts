import { registerAs } from '@nestjs/config';

/**
 * Upload Configuration
 * 
 * NOTE: Storage provider selection (STORAGE_PROVIDER) is read directly from
 * process.env in StorageFactoryService, not from this config file.
 * This is because NestJS config factory functions execute BEFORE env is fully loaded.
 * 
 * This config file only contains settings that are accessed AFTER app initialization.
 */
export default registerAs('upload', () => ({
  // File Size Limits (in bytes)
  maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10), // 5MB default
  maxDocumentSize: parseInt(process.env.MAX_DOCUMENT_SIZE || '10485760', 10), // 10MB default
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // General limit
  
  // Local Storage
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  
  // NOTE: Provider-specific configs (Google Drive, S3) are accessed directly
  // from process.env in their respective provider classes for reliability.
}));
