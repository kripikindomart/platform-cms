import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for Query Generated Modules
 * Support pagination, search, filtering, dan sorting
 */
export class QueryModulesDto {
  @ApiProperty({
    description: 'Page number (starts from 1)',
    required: false,
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    required: false,
    default: 50,
    example: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 50;

  @ApiProperty({
    description: 'Search by module name atau display name',
    required: false,
    example: 'product',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    default: 'created_at',
    enum: ['module_name', 'display_name', 'created_at', 'updated_at', 'fields_count'],
  })
  @IsString()
  @IsIn(['module_name', 'display_name', 'created_at', 'updated_at', 'fields_count'])
  @IsOptional()
  sort?: string = 'created_at';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}
