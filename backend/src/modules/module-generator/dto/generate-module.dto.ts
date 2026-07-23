import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModuleFieldDto } from './module-field.dto';

/**
 * DTO for Generate Module Request
 * Main DTO untuk generate CRUD module via UI
 */
export class GenerateModuleDto {
  @ApiProperty({
    description: 'Module name (snake_case, lowercase, singular)',
    required: true,
    maxLength: 100,
    example: 'product',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Module name harus lowercase, start dengan huruf, dan hanya boleh underscore',
  })
  moduleName!: string;

  @ApiProperty({
    description: 'Display name (user-friendly, Title Case)',
    required: true,
    maxLength: 255,
    example: 'Product',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  displayName!: string;

  @ApiProperty({
    description: 'Module description',
    required: false,
    maxLength: 500,
    example: 'Product management module untuk inventory',
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Enable tenant isolation (multi-tenancy)',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isTenantIsolated?: boolean;

  @ApiProperty({
    description: 'Enable soft delete (deleted_at column)',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  hasSoftDelete?: boolean;

  @ApiProperty({
    description: 'Enable audit fields (created_by, updated_by)',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  hasAudit?: boolean;

  @ApiProperty({
    description: 'Array of field names yang support search',
    required: false,
    type: [String],
    example: ['name', 'description'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  searchableFields?: string[];

  @ApiProperty({
    description: 'Array of field names yang support filtering',
    required: false,
    type: [String],
    example: ['price', 'stock', 'is_active'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  filterableFields?: string[];

  @ApiProperty({
    description: 'Array of field names yang support sorting',
    required: false,
    type: [String],
    example: ['name', 'price', 'created_at'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sortableFields?: string[];

  @ApiProperty({
    description: 'Array of field definitions (minimal 1)',
    required: true,
    type: [ModuleFieldDto],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal 1 field harus didefinisikan' })
  @ValidateNested({ each: true })
  @Type(() => ModuleFieldDto)
  fields!: ModuleFieldDto[];

  @ApiProperty({
    description: 'UI/UX Configuration (JSON string or object)',
    required: false,
    example: '{"createFormType":"modal","editFormType":"page"}',
  })
  @IsOptional()
  uiConfig?: string | object;
}
