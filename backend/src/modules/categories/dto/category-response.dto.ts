import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for category
 */
export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  id!: number;

  @ApiProperty({ description: 'Parent category ID', required: false })
  parent_id?: number;

  @ApiProperty({ description: 'Category name' })
  name!: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug!: string;

  @ApiProperty({ description: 'Category description', required: false })
  description?: string;

  @ApiProperty({ description: 'Category type' })
  type!: string;

  @ApiProperty({ description: 'Display order' })
  order!: number;

  @ApiProperty({ description: 'Is category active' })
  is_active!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at!: Date;
}
