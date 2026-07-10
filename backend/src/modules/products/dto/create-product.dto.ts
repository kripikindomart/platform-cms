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
} from 'class-validator';

/**
 * DTO for creating product
 */
export class CreateProductDto {
  @ApiProperty({ description: 'Name', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Sku', required: true })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price', required: true })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Stock', required: false })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ description: 'Active', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
