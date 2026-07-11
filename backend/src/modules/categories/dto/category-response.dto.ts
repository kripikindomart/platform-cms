import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for category
 */
export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  id?: number;

  @ApiProperty({ description: 'Parent_id', required: false })
  parent_id?: number;

  @ApiProperty({ description: 'Name', required: false })
  name?: string;

  @ApiProperty({ description: 'Slug', required: false })
  slug?: string;

  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @ApiProperty({ description: 'Type', required: false })
  type?: string;

  @ApiProperty({ description: 'Order', required: false })
  order?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
