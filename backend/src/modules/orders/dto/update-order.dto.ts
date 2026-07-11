import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

/**
 * DTO for updating order
 * All fields from Create DTO are optional
 */
export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
