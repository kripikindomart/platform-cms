import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GenerateModuleDto } from './generate-module.dto';

/**
 * DTO for Update Module Metadata
 * Partial dari GenerateModuleDto - semua fields optional
 */
export class UpdateModuleDto extends PartialType(GenerateModuleDto) {
  @IsOptional()
  @IsString()
  fieldConfigurations?: string; // JSON string dari field configurations (inputType, placeholder, helpText, validations)
}
