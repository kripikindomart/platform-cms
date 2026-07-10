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
    required: true,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Sku',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({
    description: 'Email',
    required: true,
  })
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Price',
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Max(999999999)
  @IsNotEmpty()
  price!: number;
}
