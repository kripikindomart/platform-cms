/**
 * Local Storage Provider
 * Simpan files di local filesystem (fallback/development)
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IStorageProvider,
  UploadOptions,
  UploadResult,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private uploadDir: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir =
      this.configService.get('UPLOAD_DEST') || './uploads';
    this.baseUrl =
      this.configService.get('APP_URL') || 'http://localhost:3000';
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Upload directory: ${this.uploadDir}`);
    } catch (error) {
      this.logger.error('Gagal membuat upload directory:', error);
    }
  }

  getName(): string {
    return 'local';
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = options.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${sanitizedName}`;

      // Folder path (optional subfolder)
      const folder = options.folder || 'general';
      const folderPath = path.join(this.uploadDir, folder);
      await fs.mkdir(folderPath, { recursive: true });

      // Full file path
      const filepath = path.join(folderPath, filename);

      // Write file
      await fs.writeFile(filepath, options.buffer);

      // Public URL
      const publicUrl = `${this.baseUrl}/uploads/${folder}/${filename}`;

      this.logger.log(`File uploaded locally: ${filepath}`);

      return {
        url: publicUrl,
        fileId: `${folder}/${filename}`,
        filename: filename,
        size: options.buffer.length,
        mimetype: options.mimetype,
        provider: this.getName(),
        metadata: {
          filepath: filepath,
          folder: folder,
        },
      };
    } catch (error) {
      this.logger.error('Gagal upload ke local storage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Upload ke local storage gagal: ${errorMessage}`);
    }
  }

  async delete(fileId: string): Promise<boolean> {
    try {
      const filepath = path.join(this.uploadDir, fileId);
      await fs.unlink(filepath);
      this.logger.log(`File dihapus dari local storage: ${filepath}`);
      return true;
    } catch (error) {
      this.logger.error('Gagal hapus file dari local storage:', error);
      return false;
    }
  }

  async getPublicUrl(fileId: string): Promise<string> {
    return `${this.baseUrl}/uploads/${fileId}`;
  }

  async exists(fileId: string): Promise<boolean> {
    try {
      const filepath = path.join(this.uploadDir, fileId);
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }
}
