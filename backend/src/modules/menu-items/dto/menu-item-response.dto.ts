import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for menu-item
 */
export class MenuItemResponseDto {
  @ApiProperty({ description: 'MenuItem ID' })
  id?: number;

  @ApiProperty({ description: 'Menu_id', required: false })
  menu_id?: number;

  @ApiProperty({ description: 'Parent_id', required: false })
  parent_id?: number;

  @ApiProperty({ description: 'Module_name', required: false })
  module_name?: string;

  @ApiProperty({ description: 'Label', required: false })
  label?: string;

  @ApiProperty({ description: 'Url', required: false })
  url?: string;

  @ApiProperty({ description: 'Icon', required: false })
  icon?: string;

  @ApiProperty({ description: 'Order', required: false })
  order?: number;

  @ApiProperty({ description: 'Is_active', required: false })
  is_active?: boolean;

  @ApiProperty({ description: 'Required_permission', required: false })
  required_permission?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  metadata?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
