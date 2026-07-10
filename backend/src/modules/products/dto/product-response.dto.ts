import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for product
 */
export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id?: number;

  @ApiProperty({ description: 'Name' })
  name?: string;

  @ApiProperty({ description: 'Sku' })
  sku?: string;

  @ApiProperty({ description: 'Email' })
  email?: string;

  @ApiProperty({ description: 'Price' })
  price?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
