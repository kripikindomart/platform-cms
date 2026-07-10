import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for post
 */
export class PostResponseDto {
  @ApiProperty({ description: 'Post ID' })
  id?: number;

  @ApiProperty({ description: 'Title', required: false })
  title?: string;

  @ApiProperty({ description: 'Slug', required: false })
  slug?: string;

  @ApiProperty({ description: 'Content', required: false })
  content?: string;

  @ApiProperty({ description: 'Status', required: false })
  status?: string;

  @ApiProperty({ description: 'Published_at', required: false })
  published_at?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deleted_at?: Date | null;
}
