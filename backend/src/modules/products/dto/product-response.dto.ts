import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for product
 */
export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id?: number;

  @ApiProperty({ description: 'Name', required: false })
  name?: string;

  @ApiProperty({ description: 'Sku', required: false })
  sku?: string;

  @ApiProperty({ description: 'Price', required: false })
  price?: number;

  @ApiProperty({ description: 'Stock', required: false })
  stock?: number;

  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
