import { PartialType } from '@nestjs/swagger';
import { GenerateModuleDto } from './generate-module.dto';

/**
 * DTO for Update Module Metadata
 * Partial dari GenerateModuleDto - semua fields optional
 */
export class UpdateModuleDto extends PartialType(GenerateModuleDto) {}
