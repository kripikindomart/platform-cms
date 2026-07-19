import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for setting
 */
export class SettingResponseDto {
  @ApiProperty({ description: 'Setting ID' })
  id?: number;

  @ApiProperty({ description: 'Category', required: false })
  category?: string;

  @ApiProperty({ description: 'Key', required: false })
  key?: string;

  @ApiProperty({ description: 'Value', required: false })
  value?: string;

  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @ApiProperty({ description: 'Is_encrypted', required: false })
  is_encrypted?: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;
}
