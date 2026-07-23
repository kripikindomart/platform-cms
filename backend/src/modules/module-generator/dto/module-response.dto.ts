import { ApiProperty } from '@nestjs/swagger';
import { GeneratedModule } from '../entities/generated-module.entity';

/**
 * DTO for Module List Response
 * Simplified response untuk list endpoints
 */
export class ModuleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'product' })
  moduleName!: string;

  @ApiProperty({ example: 'Product' })
  displayName!: string;

  @ApiProperty({ example: 'Product management module' })
  description?: string;

  @ApiProperty({ example: 'draft', enum: ['draft', 'published', 'archived'] })
  status!: string;

  @ApiProperty({ example: 3 })
  fieldsCount!: number;

  @ApiProperty({ example: 5 })
  installCount!: number;

  @ApiProperty({ example: '2026-07-22T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ 
    example: { id: 1, name: 'John Doe' },
    description: 'Creator user info',
  })
  createdBy?: {
    id: number;
    name?: string;
  };

  constructor(entity: GeneratedModule) {
    this.id = entity.id;
    this.moduleName = entity.moduleName;
    this.displayName = entity.displayName;
    this.description = entity.description || undefined;
    this.status = entity.status;
    this.fieldsCount = entity.fieldsCount;
    this.installCount = entity.installCount;
    this.createdAt = entity.createdAt;
    
    // Will be populated from join if needed
    this.createdBy = entity.createdBy ? {
      id: entity.createdBy,
    } : undefined;
  }
}
