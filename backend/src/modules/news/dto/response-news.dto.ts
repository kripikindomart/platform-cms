import { ApiProperty } from '@nestjs/swagger';

/**
 * news Response DTO
 * @generated
 */
export class NewsResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  uuid?: string;

  @ApiProperty()
  title?: string;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  date?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty({ required: false })
  updated_at?: Date;

  @ApiProperty({ required: false })
  deleted_at?: Date;
}

/**
 * Paginated news Response
 * @generated
 */
export class PaginatedNewsResponseDto {
  @ApiProperty({ type: [NewsResponseDto] })
  data!: NewsResponseDto[];

  @ApiProperty()
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
