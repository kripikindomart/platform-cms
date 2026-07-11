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
 * DTO for creating category
 */
export class CreateCategoryDto {
  @ApiProperty({ description: 'Parent category ID', required: false })
  @IsNumber()
  @IsOptional()
  parent_id?: number;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug!: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category type (e.g., product, content)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type!: string;

  @ApiProperty({ description: 'Display order', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @ApiProperty({ description: 'Is category active', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
