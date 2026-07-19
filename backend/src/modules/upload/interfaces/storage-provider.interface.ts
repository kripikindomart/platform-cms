/**
 * Storage Provider Interface
 * Kontrak untuk semua storage provider (Google Drive, S3, Cloudinary, dll)
 */

export interface UploadOptions {
  /** File buffer */
  buffer: Buffer;
  /** Original filename */
  originalname: string;
  /** MIME type */
  mimetype: string;
  /** Folder/path tujuan (opsional) */
  folder?: string;
  /** Metadata tambahan */
  metadata?: Record<string, any>;
}

export interface UploadResult {
  /** URL publik untuk akses file */
  url: string;
  /** ID file di provider (untuk delete/update) */
  fileId: string;
  /** Nama file yang disimpan */
  filename: string;
  /** Ukuran file dalam bytes */
  size: number;
  /** MIME type */
  mimetype: string;
  /** Provider yang digunakan */
  provider: string;
  /** Metadata tambahan dari provider */
  metadata?: Record<string, any>;
}

export interface IStorageProvider {
  /**
   * Upload file ke storage
   */
  upload(options: UploadOptions): Promise<UploadResult>;

  /**
   * Delete file dari storage
   */
  delete(fileId: string): Promise<boolean>;

  /**
   * Get public URL dari file
   */
  getPublicUrl(fileId: string): Promise<string>;

  /**
   * Check apakah file exists
   */
  exists(fileId: string): Promise<boolean>;

  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Test if provider is ready (optional)
   */
  isReady?(): Promise<{ ready: boolean; message: string; details?: any }>;
}
