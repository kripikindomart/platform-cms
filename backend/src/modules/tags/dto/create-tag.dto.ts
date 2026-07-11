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
 * DTO for creating tag
 */
export class CreateTagDto {
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
    description: 'Slug',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Color',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Usage_count',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  usage_count?: number;
}
