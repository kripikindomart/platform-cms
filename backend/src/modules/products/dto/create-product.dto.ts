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
 * DTO for creating product
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Name',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Sku',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Price',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Stock',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
