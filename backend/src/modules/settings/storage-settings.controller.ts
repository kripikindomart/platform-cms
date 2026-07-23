/**
 * Storage Settings Controller
 * Specialized endpoints for storage/upload configuration
 */

import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

// DTOs
class UpdateStorageProviderDto {
  active_provider!: 'google-drive' | 's3' | 'local';
  fallback_provider?: 'google-drive' | 's3' | 'local';
}

class UpdateGoogleDriveDto {
  folder_id?: string;
  folder_name?: string;
  credentials_path?: string;
}

class UpdateS3Dto {
  bucket?: string;
  region?: string;
  access_key?: string;
  secret_key?: string;
  endpoint?: string;
}

class UpdateLimitsDto {
  max_file_size_mb?: number;
  max_image_size_mb?: number;
  allowed_image_types?: string[];
  allowed_document_types?: string[];
}

class UpdateFoldersDto {
  images?: string;
  documents?: string;
  temp?: string;
}

class TestConnectionDto {
  provider!: 'google-drive' | 's3' | 'local';
  config?: any;
}

@Controller('settings/storage')
@UseGuards(JwtAuthGuard)
export class StorageSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get all storage settings
   * GET /api/settings/storage
   */
  @Get()
  async getStorageSettings() {
    const settings = await this.settingsService.getStorageSettings();

    return {
      success: true,
      data: settings,
    };
  }

  /**
   * Get storage info (public - for upload module)
   */
  @Public()
  @Get('info')
  async getStorageInfo() {
    const settings = await this.settingsService.getStorageSettings();

    return {
      success: true,
      data: {
        provider: settings.provider.active_provider,
        limits: settings.limits,
      },
    };
  }

  /**
   * Update storage provider
   * PUT /api/settings/storage/provider
   */
  @Put('provider')
  @HttpCode(HttpStatus.OK)
  async updateProvider(
    @Body() dto: UpdateStorageProviderDto,
    @CurrentUser() user: any,
  ) {
    const setting = await this.settingsService.updateStorageSettings(
      'provider',
      dto,
      user?.id,
    );

    return {
      success: true,
      message: 'Storage provider berhasil diupdate',
      data: setting,
    };
  }

  /**
   * Update Google Drive configuration
   * PUT /api/settings/storage/google-drive
   */
  @Put('google-drive')
  @HttpCode(HttpStatus.OK)
  async updateGoogleDrive(
    @Body() dto: UpdateGoogleDriveDto,
    @CurrentUser() user: any,
  ) {
    const setting = await this.settingsService.updateStorageSettings(
      'google_drive',
      dto,
      user?.id,
    );

    return {
      success: true,
      message: 'Google Drive configuration berhasil diupdate',
      data: setting,
    };
  }

  /**
   * Update S3 configuration
   * PUT /api/settings/storage/s3
   */
  @Put('s3')
  @HttpCode(HttpStatus.OK)
  async updateS3(
    @Body() dto: UpdateS3Dto,
    @CurrentUser() user: any,
  ) {
    const setting = await this.settingsService.updateStorageSettings(
      's3',
      dto,
      user?.id,
    );

    return {
      success: true,
      message: 'S3 configuration berhasil diupdate',
      data: setting,
    };
  }

  /**
   * Update file limits
   * PUT /api/settings/storage/limits
   */
  @Put('limits')
  @HttpCode(HttpStatus.OK)
  async updateLimits(
    @Body() dto: UpdateLimitsDto,
    @CurrentUser() user: any,
  ) {
    const setting = await this.settingsService.updateStorageSettings(
      'limits',
      dto,
      user?.id,
    );

    return {
      success: true,
      message: 'File limits berhasil diupdate',
      data: setting,
    };
  }

  /**
   * Update folder structure
   * PUT /api/settings/storage/folders
   */
  @Put('folders')
  @HttpCode(HttpStatus.OK)
  async updateFolders(
    @Body() dto: UpdateFoldersDto,
    @CurrentUser() user: any,
  ) {
    const setting = await this.settingsService.updateStorageSettings(
      'folders',
      dto,
      user?.id,
    );

    return {
      success: true,
      message: 'Folder structure berhasil diupdate',
      data: setting,
    };
  }

  /**
   * Test storage connection
   * POST /api/settings/storage/test
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body() dto: TestConnectionDto) {
    // TODO: Implement actual connection testing
    // For now, return mock response
    
    return {
      success: true,
      message: `Connection test untuk ${dto.provider} berhasil`,
      data: {
        provider: dto.provider,
        status: 'connected',
        tested_at: new Date(),
      },
    };
  }
}
