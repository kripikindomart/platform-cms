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
 * DTO for creating menu-item
 */
export class CreateMenuItemDto {
  @ApiProperty({
    description: 'Menu_id',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  menu_id?: number;

  @ApiProperty({
    description: 'Parent_id',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parent_id?: number;

  @ApiProperty({
    description: 'Module_name',
    required: false,
  })
  @IsString()
  @IsOptional()
  module_name?: string;

  @ApiProperty({
    description: 'Label',
    required: false,
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({
    description: 'Url',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'Icon',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Order',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'Is_active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Required_permission',
    required: false,
  })
  @IsString()
  @IsOptional()
  required_permission?: string;

  @ApiProperty({
    description: 'Metadata',
    required: false,
  })
  @IsString()
  @IsOptional()
  metadata?: string;
}
