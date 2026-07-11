import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO for updating category
 * All fields from Create DTO are optional
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
