/**
 * Upload Service
 * Unified service untuk upload files menggunakan storage provider yang dipilih
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  StorageFactoryService,
  StorageProviderType,
} from './storage-factory.service';
import { UploadResult } from './interfaces/storage-provider.interface';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  // Allowed file types
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  // Max file sizes (in bytes)
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

  constructor(private storageFactory: StorageFactoryService) {}

  /**
   * Upload image file
   */
  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
    providerType?: StorageProviderType,
  ): Promise<UploadResult> {
    this.validateImageFile(file);

    const provider = this.storageFactory.getProvider(providerType);

    try {
      const result = await provider.upload({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        // FIXME: Subfolder support - for now upload directly to root folder
        // folder: folder || 'images',
      });

      this.logger.log(
        `Image uploaded: ${result.filename} via ${result.provider}`,
      );

      return result;
    } catch (error) {
      this.logger.error('Upload image gagal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Upload image gagal: ${errorMessage}`,
      );
    }
  }

  /**
   * Upload document file
   */
  async uploadDocument(
    file: Express.Multer.File,
    folder?: string,
    providerType?: StorageProviderType,
  ): Promise<UploadResult> {
    this.validateDocumentFile(file);

    const provider = this.storageFactory.getProvider(providerType);

    try {
      const result = await provider.upload({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        folder: folder || 'documents',
      });

      this.logger.log(
        `Document uploaded: ${result.filename} via ${result.provider}`,
      );

      return result;
    } catch (error) {
      this.logger.error('Upload document gagal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Upload document gagal: ${errorMessage}`,
      );
    }
  }

  /**
   * Upload any file (generic)
   */
  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
    providerType?: StorageProviderType,
  ): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File tidak valid');
    }

    const provider = this.storageFactory.getProvider(providerType);

    try {
      const result = await provider.upload({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        folder: folder || 'files',
      });

      this.logger.log(
        `File uploaded: ${result.filename} via ${result.provider}`,
      );

      return result;
    } catch (error) {
      this.logger.error('Upload file gagal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Upload file gagal: ${errorMessage}`,
      );
    }
  }

  /**
   * Delete file
   */
  async deleteFile(
    fileId: string,
    providerType?: StorageProviderType,
  ): Promise<boolean> {
    const provider = this.storageFactory.getProvider(providerType);

    try {
      const result = await provider.delete(fileId);
      this.logger.log(`File deleted: ${fileId} from ${provider.getName()}`);
      return result;
    } catch (error) {
      this.logger.error('Delete file gagal:', error);
      return false;
    }
  }

  /**
   * Get public URL
   */
  async getPublicUrl(
    fileId: string,
    providerType?: StorageProviderType,
  ): Promise<string> {
    const provider = this.storageFactory.getProvider(providerType);
    return await provider.getPublicUrl(fileId);
  }

  /**
   * Validate image file
   */
  private validateImageFile(file: Express.Multer.File): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('File tidak valid');
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipe file tidak didukung. Hanya diizinkan: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `Ukuran file terlalu besar. Maksimal ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Validate document file
   */
  private validateDocumentFile(file: Express.Multer.File): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('File tidak valid');
    }

    if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipe file tidak didukung. Hanya diizinkan: ${this.ALLOWED_DOCUMENT_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_DOCUMENT_SIZE) {
      throw new BadRequestException(
        `Ukuran file terlalu besar. Maksimal ${this.MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Get storage info
   */
  getStorageInfo() {
    return {
      defaultProvider: this.storageFactory.getDefaultProviderName(),
      availableProviders: this.storageFactory.getAvailableProviders(),
      maxImageSize: this.MAX_IMAGE_SIZE,
      maxDocumentSize: this.MAX_DOCUMENT_SIZE,
      allowedImageTypes: this.ALLOWED_IMAGE_TYPES,
      allowedDocumentTypes: this.ALLOWED_DOCUMENT_TYPES,
    };
  }
}
