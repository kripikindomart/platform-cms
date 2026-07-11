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
  // TODO: Add your fields here with validation decorators
  // Example:
  // @ApiProperty({ description: 'Name of the product' })
  // @IsString()
  // @IsNotEmpty()
  // name: string;
  // @ApiProperty({ description: 'Description', required: false })
  // @IsString()
  // @IsOptional()
  // description?: string;
}
