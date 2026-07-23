import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationRuleDto } from './validation-rule.dto';

/**
 * DTO for Module Field Definition
 * Defines struktur field dalam generated module
 */
export class ModuleFieldDto {
  @ApiProperty({
    description: 'Field name (snake_case, lowercase)',
    required: true,
    maxLength: 100,
    example: 'product_name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Field name harus lowercase, start dengan huruf, dan hanya boleh underscore',
  })
  name!: string;

  @ApiProperty({
    description: 'Field label (for UI display)',
    required: true,
    maxLength: 255,
    example: 'Product Name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label!: string;

  @ApiProperty({
    description: 'Field type',
    required: true,
    example: 'string',
    enum: [
      'string',
      'text',
      'number',
      'boolean',
      'date',
      'datetime',
      'email',
      'url',
      'uuid',
      'json',
      'enum',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'string',
    'text',
    'number',
    'boolean',
    'date',
    'datetime',
    'email',
    'url',
    'uuid',
    'json',
    'enum',
  ])
  type!: string;

  @ApiProperty({
    description: 'Field length (for string/varchar)',
    required: false,
    example: 255,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  length?: number;

  @ApiProperty({
    description: 'Precision (for decimal)',
    required: false,
    example: 10,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  precision?: number;

  @ApiProperty({
    description: 'Scale (for decimal)',
    required: false,
    example: 2,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  scale?: number;

  @ApiProperty({
    description: 'Is field required (NOT NULL)',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    description: 'Is field unique (UNIQUE constraint)',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isUnique?: boolean;

  @ApiProperty({
    description: 'Is field visible in list view',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisibleInList?: boolean;

  @ApiProperty({
    description: 'Enum options (for enum type only)',
    required: false,
    example: ['active', 'inactive', 'pending'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enumOptions?: string[];

  @ApiProperty({
    description: 'Default value for field',
    required: false,
    example: null,
  })
  @IsOptional()
  defaultValue?: any;

  @ApiProperty({
    description: 'Array of validation rules',
    required: false,
    type: [ValidationRuleDto],
    example: [
      { type: 'minLength', value: 3 },
      { type: 'maxLength', value: 255 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationRuleDto)
  @IsOptional()
  validations?: ValidationRuleDto[];

  @ApiProperty({
    description: 'Display order in forms',
    required: false,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
