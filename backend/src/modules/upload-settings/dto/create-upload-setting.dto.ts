import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { FileCategory, GoogleDriveUrlFormat } from '../../upload/enums/url-format.enum';

/**
 * DTO for creating upload-setting
 */
export class CreateUploadSettingDto {
  @ApiProperty({
    description: 'File category (image, document, video, audio, other)',
    required: true,
    enum: FileCategory,
    example: FileCategory.IMAGE,
  })
  @IsEnum(FileCategory, {
    message: 'Category must be one of: image, document, video, audio, other',
  })
  @IsNotEmpty()
  category!: FileCategory;

  @ApiProperty({
    description: 'Google Drive URL format to use for this category',
    required: true,
    enum: GoogleDriveUrlFormat,
    example: GoogleDriveUrlFormat.DIRECT_VIEW,
  })
  @IsEnum(GoogleDriveUrlFormat, {
    message: 'URL format must be one of: direct_view, thumbnail, download, embed_view',
  })
  @IsNotEmpty()
  url_format!: GoogleDriveUrlFormat;

  @ApiProperty({
    description: 'Thumbnail size in pixels (only used for THUMBNAIL format)',
    required: false,
    minimum: 100,
    maximum: 2000,
    default: 200,
    example: 200,
  })
  @IsNumber()
  @Min(100, { message: 'Thumbnail size must be at least 100px' })
  @Max(2000, { message: 'Thumbnail size must not exceed 2000px' })
  @IsOptional()
  thumbnail_size?: number;

  @ApiProperty({
    description: 'Whether this setting is active',
    required: false,
    default: true,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
