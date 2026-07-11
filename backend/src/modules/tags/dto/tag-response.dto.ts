import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for tag
 */
export class TagResponseDto {
  @ApiProperty({ description: 'Tag ID' })
  id?: number;

  @ApiProperty({ description: 'Name', required: false })
  name?: string;

  @ApiProperty({ description: 'Slug', required: false })
  slug?: string;

  @ApiProperty({ description: 'Color', required: false })
  color?: string;

  @ApiProperty({ description: 'Usage_count', required: false })
  usage_count?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
