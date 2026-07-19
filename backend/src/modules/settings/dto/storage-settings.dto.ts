/**
 * Storage Settings DTOs
 */

import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min, Max } from 'class-validator';

export class StorageProviderConfigDto {
  @IsString()
  active_provider!: string; // 'google-drive', 's3', 'local'

  @IsString()
  @IsOptional()
  fallback_provider?: string;
}

export class GoogleDriveConfigDto {
  @IsString()
  @IsOptional()
  folder_id?: string;

  @IsString()
  @IsOptional()
  folder_name?: string;

  @IsString()
  @IsOptional()
  credentials_path?: string;
}

export class S3ConfigDto {
  @IsString()
  @IsOptional()
  bucket?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  access_key?: string;

  @IsString()
  @IsOptional()
  secret_key?: string;
}

export class StorageLimitsDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  max_file_size_mb!: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  max_image_size_mb!: number;

  @IsArray()
  @IsString({ each: true })
  allowed_image_types!: string[];

  @IsArray()
  @IsString({ each: true })
  allowed_document_types!: string[];
}

export class StorageFoldersDto {
  @IsString()
  images!: string;

  @IsString()
  documents!: string;

  @IsString()
  temp!: string;
}

export class UpdateStorageSettingsDto {
  @IsOptional()
  provider?: StorageProviderConfigDto;

  @IsOptional()
  google_drive?: GoogleDriveConfigDto;

  @IsOptional()
  s3?: S3ConfigDto;

  @IsOptional()
  limits?: StorageLimitsDto;

  @IsOptional()
  folders?: StorageFoldersDto;
}

export class CreateFolderDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  parent_id?: string;
}

export class TestConnectionDto {
  @IsString()
  provider!: string; // 'google-drive', 's3'

  @IsOptional()
  config?: Record<string, any>;
}

export class StorageStatsResponseDto {
  total_files!: number;
  total_size_bytes!: number;
  total_size_mb!: number;
  files_by_type!: Record<string, number>;
  storage_by_folder!: Record<string, number>;
  recent_uploads!: number; // Last 7 days
}

export class FolderResponseDto {
  id!: string;
  name!: string;
  parent_id?: string;
  path!: string;
  file_count?: number;
  size_bytes?: number;
  created_at?: string;
}

export class FileItemDto {
  id!: string;
  name!: string;
  type!: string;
  size_bytes!: number;
  size_mb!: number;
  folder!: string;
  url!: string;
  thumbnail_url?: string;
  created_at!: string;
  created_by?: string;
}
