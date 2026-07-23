import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, isNull, desc } from 'drizzle-orm';
import { visualModules, visualModuleFields, type VisualModule } from '../../database/schema/public/visual-modules.schema';
import { validationTypes, visualModuleFieldValidations } from '../../database/schema/public/validation-types.schema';

/**
 * Repository untuk Visual Module Builder
 * Handles database operations untuk visual_modules table
 * PUBLIC schema (global, not tenant-isolated)
 */
@Injectable()
export class ModuleMetadataRepository {
  constructor(
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<any>,
  ) {}

  /**
   * Find all modules dengan pagination dan filtering
   * PUBLIC schema - not tenant-isolated
   */
  async findAll(query: any): Promise<{
    data: VisualModule[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50 } = query;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [
      isNull(visualModules.deletedAt), // Soft delete filter
    ];

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(visualModules)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get data with pagination
    const data = await this.db
      .select()
      .from(visualModules)
      .where(whereClause)
      .orderBy(desc(visualModules.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find module by ID
   */
  async findById(id: number): Promise<VisualModule | null> {
    const results = await this.db
      .select()
      .from(visualModules)
      .where(
        and(
          eq(visualModules.id, id),
          isNull(visualModules.deletedAt),
        ),
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find module by name
   */
  async findByName(moduleName: string): Promise<VisualModule | null> {
    const results = await this.db
      .select()
      .from(visualModules)
      .where(
        and(
          eq(visualModules.moduleName, moduleName),
          isNull(visualModules.deletedAt),
        ),
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Create new module metadata
   */
  async create(data: Partial<VisualModule>): Promise<VisualModule> {
    const results = await this.db
      .insert(visualModules)
      .values(data as any)
      .returning();

    return results[0];
  }

  /**
   * Update module metadata
   */
  async update(id: number, data: Partial<VisualModule>): Promise<VisualModule | null> {
    const results = await this.db
      .update(visualModules)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(visualModules.id, id),
          isNull(visualModules.deletedAt),
        ),
      )
      .returning();

    return results[0] || null;
  }

  /**
   * Soft delete module
   */
  async softDelete(id: number, deletedBy: number): Promise<void> {
    await this.db
      .update(visualModules)
      .set({
        deletedAt: new Date(),
        deletedBy,
      })
      .where(eq(visualModules.id, id));
  }

  /**
   * Hard delete module (permanent)
   * Also deletes associated fields and validations
   */
  async hardDelete(id: number): Promise<void> {
    // Delete field validations first (foreign key constraint)
    await this.db.execute(sql`
      DELETE FROM visual_module_field_validations
      WHERE field_id IN (
        SELECT id FROM visual_module_fields WHERE module_id = ${id}
      )
    `);

    // Delete fields
    await this.db
      .delete(visualModuleFields)
      .where(eq(visualModuleFields.moduleId, id));

    // Delete module
    await this.db
      .delete(visualModules)
      .where(eq(visualModules.id, id));
  }

  /**
   * Check if module name already exists
   */
  async existsByName(moduleName: string): Promise<boolean> {
    const module = await this.findByName(moduleName);
    return module !== null;
  }

  /**
   * Save module fields to visual_module_fields
   */
  async saveFields(moduleId: number, fields: any[]): Promise<void> {
    // Delete existing fields for this module
    await this.db
      .delete(visualModuleFields)
      .where(eq(visualModuleFields.moduleId, moduleId));

    // Insert new fields
    if (fields.length > 0) {
      const fieldData = fields.map((field, index) => ({
        moduleId,
        fieldName: field.name,
        fieldLabel: field.label,
        fieldType: field.type,
        fieldLength: field.length,
        precision: field.precision,
        scale: field.scale,
        isVisibleInList: field.isVisibleInList ?? true,
        defaultValue: field.defaultValue,
        fieldOrder: field.order ?? index,
      }));

      await this.db
        .insert(visualModuleFields)
        .values(fieldData);
    }
  }

  /**
   * Get module fields
   */
  async getFields(moduleId: number): Promise<any[]> {
    const fields = await this.db
      .select()
      .from(visualModuleFields)
      .where(eq(visualModuleFields.moduleId, moduleId))
      .orderBy(visualModuleFields.fieldOrder);

    return fields;
  }

  /**
   * Get all validation types (master data)
   */
  async getValidationTypes(): Promise<any[]> {
    const types = await this.db
      .select()
      .from(validationTypes)
      .where(eq(validationTypes.isActive, true))
      .orderBy(validationTypes.code);

    return types;
  }

  /**
   * Get validation types for specific field type
   */
  async getValidationTypesForFieldType(fieldType: string): Promise<any[]> {
    const types = await this.db
      .select()
      .from(validationTypes)
      .where(
        and(
          eq(validationTypes.isActive, true),
          sql`${fieldType} = ANY(${validationTypes.applicableFieldTypes})`
        )
      )
      .orderBy(validationTypes.code);

    return types;
  }

  /**
   * Get field validations
   */
  async getFieldValidations(fieldId: number): Promise<any[]> {
    const validations = await this.db
      .select({
        id: visualModuleFieldValidations.id,
        validationType: validationTypes,
        validationValue: visualModuleFieldValidations.validationValue,
        errorMessage: visualModuleFieldValidations.errorMessage,
        validationOrder: visualModuleFieldValidations.validationOrder,
      })
      .from(visualModuleFieldValidations)
      .leftJoin(validationTypes, eq(visualModuleFieldValidations.validationTypeId, validationTypes.id))
      .where(eq(visualModuleFieldValidations.fieldId, fieldId))
      .orderBy(visualModuleFieldValidations.validationOrder);

    return validations;
  }

  /**
   * Save field validations
   */
  async saveFieldValidations(fieldId: number, validations: any[]): Promise<void> {
    // Delete existing validations
    await this.db
      .delete(visualModuleFieldValidations)
      .where(eq(visualModuleFieldValidations.fieldId, fieldId));

    // Insert new validations
    if (validations.length > 0) {
      const validationData = validations.map((v, index) => ({
        fieldId,
        validationTypeId: v.validationTypeId,
        validationValue: v.validationValue,
        errorMessage: v.errorMessage,
        validationOrder: v.validationOrder ?? index,
      }));

      await this.db
        .insert(visualModuleFieldValidations)
        .values(validationData);
    }
  }
}
