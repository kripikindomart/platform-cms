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
  name: string;

  @ApiProperty({
    description: 'Sku',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    description: 'Email',
    required: true,
  })
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Website',
    required: false,
  })
  @IsUrl()
  @MaxLength(500)
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Description',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price',
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Max(999999999)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Stock',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Published_at',
    required: false,
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  published_at?: Date;

  @ApiProperty({
    description: 'Status',
    required: false,
    enum: ['draft', 'published', 'archived'],
  })
  @IsString()
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: 'draft' | 'published' | 'archived';
}
