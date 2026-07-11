import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for tag
 */
export class TagResponseDto {
  @ApiProperty({ description: 'Tag ID' })
  id?: number;

  // TODO: Add your response fields here
  // Match with entity fields

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;
}
