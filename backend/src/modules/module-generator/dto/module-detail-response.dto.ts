import { ApiProperty } from '@nestjs/swagger';
import { GeneratedModule } from '../entities/generated-module.entity';
import { GeneratedModuleField } from '../entities/generated-module-field.entity';

/**
 * Field Response DTO (nested)
 */
export class ModuleFieldResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'product_name' })
  name!: string;

  @ApiProperty({ example: 'string' })
  type!: string;

  @ApiProperty({ example: 255 })
  length?: number;

  @ApiProperty({ example: 10 })
  precision?: number;

  @ApiProperty({ example: 2 })
  scale?: number;

  @ApiProperty({ example: true })
  isRequired!: boolean;

  @ApiProperty({ example: false })
  isUnique!: boolean;

  @ApiProperty({ example: null })
  defaultValue?: any;

  @ApiProperty({
    example: [{ type: 'minLength', value: 3 }],
    description: 'Validation rules (parsed JSON)',
  })
  validations!: any[];

  @ApiProperty({ example: 1 })
  order!: number;

  constructor(entity: GeneratedModuleField) {
    this.id = entity.id;
    this.name = entity.fieldName;
    this.type = entity.fieldType;
    this.length = entity.fieldLength || undefined;
    this.precision = entity.precision || undefined;
    this.scale = entity.scale || undefined;
    this.isRequired = entity.isRequired;
    this.isUnique = entity.isUnique;
    this.defaultValue = entity.defaultValue || undefined;
    
    // Parse validations JSON string
    try {
      this.validations = entity.validations ? JSON.parse(entity.validations) : [];
    } catch {
      this.validations = [];
    }
    
    this.order = entity.fieldOrder;
  }
}

/**
 * DTO for Module Detail Response
 * Full response dengan fields untuk detail endpoints
 */
export class ModuleDetailResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'product' })
  moduleName!: string;

  @ApiProperty({ example: 'Product' })
  displayName!: string;

  @ApiProperty({ example: 'Product management module' })
  description?: string;

  @ApiProperty({ example: true })
  isTenantIsolated!: boolean;

  @ApiProperty({ example: true })
  hasSoftDelete!: boolean;

  @ApiProperty({ example: true })
  hasAudit!: boolean;

  @ApiProperty({ 
    example: ['name', 'description'],
    type: [String],
  })
  searchableFields?: string[];

  @ApiProperty({ 
    example: ['price', 'stock'],
    type: [String],
  })
  filterableFields?: string[];

  @ApiProperty({ 
    example: ['name', 'price', 'created_at'],
    type: [String],
  })
  sortableFields?: string[];

  @ApiProperty({ 
    type: [ModuleFieldResponseDto],
    description: 'Array of field definitions',
  })
  fields!: ModuleFieldResponseDto[];

  @ApiProperty({ example: 'draft', enum: ['draft', 'published', 'archived'] })
  status!: string;

  @ApiProperty({ example: 3 })
  fieldsCount!: number;

  @ApiProperty({ example: 5, description: 'Number of tenants that installed this module' })
  installCount!: number;

  @ApiProperty({ example: '2026-07-22T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-07-22T10:30:00Z' })
  updatedAt!: Date;

  @ApiProperty({ 
    example: { id: 1, name: 'John Doe' },
    description: 'Creator user info',
  })
  createdBy?: {
    id: number;
    name?: string;
  };

  constructor(module: GeneratedModule, fields: GeneratedModuleField[]) {
    this.id = module.id;
    this.moduleName = module.moduleName;
    this.displayName = module.displayName;
    this.description = module.description || undefined;
    this.status = module.status;
    this.isTenantIsolated = module.isTenantIsolated;
    this.hasSoftDelete = module.hasSoftDelete;
    this.hasAudit = module.hasAudit;
    this.searchableFields = module.searchableFields || undefined;
    this.filterableFields = module.filterableFields || undefined;
    this.sortableFields = module.sortableFields || undefined;
    
    // Transform fields
    this.fields = fields.map(f => new ModuleFieldResponseDto(f));
    
    this.fieldsCount = module.fieldsCount;
    this.installCount = module.installCount;
    this.createdAt = module.createdAt;
    this.updatedAt = module.updatedAt;
    
    this.createdBy = module.createdBy ? {
      id: module.createdBy,
    } : undefined;
  }
}
