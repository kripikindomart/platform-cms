import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
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
}
