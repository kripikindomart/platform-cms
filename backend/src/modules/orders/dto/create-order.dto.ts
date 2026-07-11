import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEmail,
  IsUrl,
  IsUUID,
  IsEnum,
  IsDate,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating order
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'Customer_name',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  customer_name?: string;

  @ApiProperty({
    description: 'Total',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(999999999)
  @IsOptional()
  total?: number;

  @ApiProperty({
    description: 'Order_date',
    required: false,
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  order_date?: Date;

  @ApiProperty({
    description: 'Status',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  status?: string;
}
