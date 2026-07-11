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
  @ApiProperty({
    description: 'Parent_id',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parent_id?: number;

  @ApiProperty({
    description: 'Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Slug',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Order',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;
}
