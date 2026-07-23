import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * DTO for creating tenant
 */
export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    required: true,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Tenant slug (URL-friendly identifier)',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Tenant domain',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  domain?: string;

  @ApiProperty({
    description: 'Subscription tier',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  subscription_tier?: string;

  @ApiProperty({
    description: 'Is tenant active',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Tenant logo URL (can be base64 data URL)',
    required: false,
  })
  @IsString()
  @IsOptional()
  logo_url?: string;

  @ApiProperty({
    description: 'Primary brand color (hex format)',
    required: false,
    maxLength: 7,
  })
  @IsString()
  @MaxLength(7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Primary color must be in hex format (#RRGGBB)',
  })
  @IsOptional()
  primary_color?: string;

  @ApiProperty({
    description: 'Secondary brand color (hex format)',
    required: false,
    maxLength: 7,
  })
  @IsString()
  @MaxLength(7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Secondary color must be in hex format (#RRGGBB)',
  })
  @IsOptional()
  secondary_color?: string;
}
