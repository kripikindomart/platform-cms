import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for menu
 */
export class MenuResponseDto {
  @ApiProperty({ description: 'Menu ID' })
  id?: number;

  @ApiProperty({ description: 'Name', required: false })
  name?: string;

  @ApiProperty({ description: 'Slug', required: false })
  slug?: string;

  @ApiProperty({ description: 'Icon', required: false })
  icon?: string;

  @ApiProperty({ description: 'Order', required: false })
  order?: number;

  @ApiProperty({ description: 'Is_active', required: false })
  is_active?: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
