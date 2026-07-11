import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';

/**
 * DTO for updating tag
 * All fields from Create DTO are optional
 */
export class UpdateTagDto extends PartialType(CreateTagDto) {}
