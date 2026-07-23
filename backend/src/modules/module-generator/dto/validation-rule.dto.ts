import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for Field Validation Rule
 * Represents single validation constraint untuk field
 */
export class ValidationRuleDto {
  @ApiProperty({
    description: 'Validation type',
    required: true,
    example: 'minLength',
    enum: ['minLength', 'maxLength', 'min', 'max', 'email', 'url', 'pattern', 'custom'],
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description: 'Validation value/parameter',
    required: false,
    example: 3,
  })
  @IsOptional()
  value?: any;

  @ApiProperty({
    description: 'Custom error message (Indonesian)',
    required: false,
    example: 'Nama minimal 3 karakter',
  })
  @IsString()
  @IsOptional()
  message?: string;
}
