import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating setting
 */
export class CreateSettingDto {
  @ApiProperty({
    description: 'Setting category (storage, security, api, etc)',
    required: true,
    maxLength: 50,
    example: 'storage',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category!: string;

  @ApiProperty({
    description: 'Setting key within category',
    required: true,
    maxLength: 100,
    example: 'provider',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key!: string;

  @ApiProperty({
    description: 'Setting value in any format (will be stored as JSONB)',
    required: true,
    example: { active_provider: 'google-drive' },
  })
  @IsNotEmpty()
  value!: any;

  @ApiProperty({
    description: 'Setting description',
    required: false,
    example: 'Active storage provider configuration',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the value contains encrypted data',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_encrypted?: boolean;
}
