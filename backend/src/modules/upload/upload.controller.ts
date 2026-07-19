/**
 * Upload Controller
 * REST API endpoints untuk upload files
 */

import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { StorageProviderType, StorageFactoryService } from './storage-factory.service';
import { Public } from '../../common/decorators/public.decorator';
import { GoogleDriveProvider } from './providers/google-drive.provider';

@Controller('upload')
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private storageFactory: StorageFactoryService,
    private googleDriveProvider: GoogleDriveProvider,
  ) {}

  /**
   * Upload image
   * POST /api/upload/image
   * @requires JWT Authentication
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('provider') provider?: StorageProviderType,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const result = await this.uploadService.uploadImage(file, folder, provider);

    return {
      success: true,
      message: 'Image berhasil diupload',
      data: result,
    };
  }

  /**
   * Upload document
   * POST /api/upload/document
   * @requires JWT Authentication
   */
  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('provider') provider?: StorageProviderType,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const result = await this.uploadService.uploadDocument(
      file,
      folder,
      provider,
    );

    return {
      success: true,
      message: 'Document berhasil diupload',
      data: result,
    };
  }

  /**
   * Upload any file (generic)
   * POST /api/upload
   * @requires JWT Authentication
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('provider') provider?: StorageProviderType,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const result = await this.uploadService.uploadFile(file, folder, provider);

    return {
      success: true,
      message: 'File berhasil diupload',
      data: result,
    };
  }

  /**
   * Delete file
   * DELETE /api/upload/:fileId
   * @requires JWT Authentication
   */
  @Delete(':fileId')
  async deleteFile(
    @Param('fileId') fileId: string,
    @Query('provider') provider?: StorageProviderType,
  ) {
    const result = await this.uploadService.deleteFile(fileId, provider);

    return {
      success: result,
      message: result
        ? 'File berhasil dihapus'
        : 'File tidak ditemukan atau gagal dihapus',
    };
  }

  /**
   * Get public URL
   * GET /api/upload/:fileId/url
   * @requires JWT Authentication
   */
  @Get(':fileId/url')
  async getPublicUrl(
    @Param('fileId') fileId: string,
    @Query('provider') provider?: StorageProviderType,
  ) {
    const url = await this.uploadService.getPublicUrl(fileId, provider);

    return {
      success: true,
      data: {
        fileId,
        url,
      },
    };
  }

  /**
   * Get storage info
   * GET /api/upload/info
   */
  @Public()
  @Get('info')
  getStorageInfo() {
    const info = this.uploadService.getStorageInfo();

    return {
      success: true,
      data: info,
    };
  }

  /**
   * Test Google Drive connection
   * GET /api/upload/test/google-drive
   */
  @Public()
  @Get('test/google-drive')
  async testGoogleDrive() {
    const result = await this.googleDriveProvider.isReady();

    return {
      success: result.ready,
      message: result.message,
      data: result.details,
    };
  }
}
