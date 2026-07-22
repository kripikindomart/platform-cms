/**
 * Upload Module
 * Module untuk file upload dengan multiple storage providers
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { StorageFactoryService } from './storage-factory.service';
import { GoogleDriveProvider } from './providers/google-drive.provider';
import { S3Provider } from './providers/s3.provider';
import { LocalStorageProvider } from './providers/local.provider';
import { UploadSettingsModule } from '../upload-settings/upload-settings.module';

@Module({
  imports: [ConfigModule, UploadSettingsModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    StorageFactoryService,
    GoogleDriveProvider,
    S3Provider,
    LocalStorageProvider,
  ],
  exports: [UploadService, StorageFactoryService],
})
export class UploadModule {}
