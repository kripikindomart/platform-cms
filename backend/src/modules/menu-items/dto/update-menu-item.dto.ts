import { PartialType } from '@nestjs/swagger';
import { CreateMenuItemDto } from './create-menu-item.dto';

/**
 * DTO for updating menu-item
 * All fields from Create DTO are optional
 */
export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
