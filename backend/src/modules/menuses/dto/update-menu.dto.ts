import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';

/**
 * DTO for updating menu
 * All fields from Create DTO are optional
 */
export class UpdateMenuDto extends PartialType(CreateMenuDto) {}
