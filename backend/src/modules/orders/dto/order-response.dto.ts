import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for order
 */
export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id?: number;

  @ApiProperty({ description: 'Customer_name', required: false })
  customer_name?: string;

  @ApiProperty({ description: 'Total', required: false })
  total?: number;

  @ApiProperty({ description: 'Order_date', required: false })
  order_date?: Date;

  @ApiProperty({ description: 'Status', required: false })
  status?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
