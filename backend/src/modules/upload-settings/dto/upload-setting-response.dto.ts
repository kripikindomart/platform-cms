import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for upload-setting
 */
export class UploadSettingResponseDto {
  @ApiProperty({ description: 'UploadSetting ID' })
  id?: number;

  @ApiProperty({ description: 'Category', required: false })
  category?: string;

  @ApiProperty({ description: 'Url_format', required: false })
  url_format?: string;

  @ApiProperty({ description: 'Thumbnail_size', required: false })
  thumbnail_size?: number;

  @ApiProperty({ description: 'Is_active', required: false })
  is_active?: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
