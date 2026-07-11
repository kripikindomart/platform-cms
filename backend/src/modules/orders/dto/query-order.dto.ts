import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query DTO for orders
 */
export class QueryOrderDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // Filterable fields
  @ApiPropertyOptional({ description: 'Filter by total' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total?: number;

  @ApiPropertyOptional({ description: 'Minimum total' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_min?: number;

  @ApiPropertyOptional({ description: 'Maximum total' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_max?: number;

  @ApiPropertyOptional({ description: 'Filter by order_date' })
  @IsOptional()
  @IsDateString()
  order_date?: string;

  @ApiPropertyOptional({ description: 'From order_date' })
  @IsOptional()
  @IsDateString()
  order_date_from?: string;

  @ApiPropertyOptional({ description: 'To order_date' })
  @IsOptional()
  @IsDateString()
  order_date_to?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['total', 'order_date', 'created_at'],
  })
  @IsOptional()
  @IsString()
  sort?: 'total' | 'order_date' | 'created_at';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}
