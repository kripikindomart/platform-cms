/**
 * CLI Metadata Repository
 * Database operations for CLI metadata tables
 */

import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc, and, sql } from 'drizzle-orm';
import * as publicSchema from '@/database/schema/public';
import {
  generatedModules,
  moduleFields,
  fieldValidations,
  generationHistory,
  GeneratedModule,
  ModuleField,
  FieldValidation,
  GenerationHistory,
  NewGeneratedModule,
  NewModuleField,
  NewFieldValidation,
  NewGenerationHistory,
} from '@/database/schema/public';

type ModuleWithFields = GeneratedModule & {
  fields: (ModuleField & { validations: FieldValidation[] })[];
};

@Injectable()
export class CliMetadataRepository {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof publicSchema>,
  ) {}

  // ============================================================================
  // GENERATED MODULES
  // ============================================================================

  /**
   * Create module record
   */
  async createModule(data: NewGeneratedModule): Promise<GeneratedModule> {
    const [module] = await this.db.insert(generatedModules).values(data).returning();
    return module;
  }

  /**
   * Find module by name
   */
  async findModuleByName(name: string): Promise<GeneratedModule | null> {
    const [module] = await this.db
      .select()
      .from(generatedModules)
      .where(and(eq(generatedModules.name, name), eq(generatedModules.is_active, true)));

    return module || null;
  }

  /**
   * Find module by ID
   */
  async findModuleById(id: number): Promise<GeneratedModule | null> {
    const [module] = await this.db
      .select()
      .from(generatedModules)
      .where(eq(generatedModules.id, id));

    return module || null;
  }

  /**
   * Find all active modules
   */
  async findAllModules(includeDeleted = false): Promise<GeneratedModule[]> {
    const query = this.db.select().from(generatedModules);

    if (!includeDeleted) {
      query.where(eq(generatedModules.is_active, true));
    }

    return query;
  }

  /**
   * Find module with fields and validations
   */
  async findModuleWithFields(name: string): Promise<ModuleWithFields | null> {
    const module = await this.findModuleByName(name);
    if (!module) return null;

    const fields = await this.findFieldsByModuleId(module.id);
    const fieldsWithValidations = await Promise.all(
      fields.map(async (field) => ({
        ...field,
        validations: await this.findValidationsByFieldId(field.id),
      })),
    );

    return {
      ...module,
      fields: fieldsWithValidations,
    };
  }

  /**
   * Soft delete module
   */
  async softDeleteModule(id: number, _deletedBy?: number): Promise<void> {
    await this.db
      .update(generatedModules)
      .set({
        is_active: false,
        deleted_at: new Date(),
        // Note: deleted_by not in schema, only tracking via history
      })
      .where(eq(generatedModules.id, id));
  }

  /**
   * Restore soft deleted module
   */
  async restoreModule(id: number): Promise<void> {
    await this.db
      .update(generatedModules)
      .set({
        is_active: true,
        deleted_at: null,
      })
      .where(eq(generatedModules.id, id));
  }

  /**
   * Hard delete module (use with caution)
   */
  async hardDeleteModule(id: number): Promise<void> {
    await this.db.delete(generatedModules).where(eq(generatedModules.id, id));
  }

  /**
   * Count modules
   */
  async countModules(activeOnly = true): Promise<number> {
    const query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(generatedModules);

    if (activeOnly) {
      query.where(eq(generatedModules.is_active, true));
    }

    const [result] = await query;
    return Number(result.count);
  }

  // ============================================================================
  // MODULE FIELDS
  // ============================================================================

  /**
   * Create field record
   */
  async createField(data: NewModuleField): Promise<ModuleField> {
    const [field] = await this.db.insert(moduleFields).values(data).returning();
    return field;
  }

  /**
   * Create multiple fields
   */
  async createFields(data: NewModuleField[]): Promise<ModuleField[]> {
    if (data.length === 0) return [];
    return this.db.insert(moduleFields).values(data).returning();
  }

  /**
   * Find fields by module ID
   */
  async findFieldsByModuleId(moduleId: number): Promise<ModuleField[]> {
    return this.db
      .select()
      .from(moduleFields)
      .where(eq(moduleFields.module_id, moduleId))
      .orderBy(moduleFields.order);
  }

  /**
   * Find field by ID
   */
  async findFieldById(id: number): Promise<ModuleField | null> {
    const [field] = await this.db
      .select()
      .from(moduleFields)
      .where(eq(moduleFields.id, id));

    return field || null;
  }

  /**
   * Update field
   */
  async updateField(id: number, data: Partial<NewModuleField>): Promise<ModuleField> {
    const [field] = await this.db
      .update(moduleFields)
      .set({ ...data, updated_at: new Date() })
      .where(eq(moduleFields.id, id))
      .returning();

    return field;
  }

  /**
   * Delete fields by module ID
   */
  async deleteFieldsByModuleId(moduleId: number): Promise<void> {
    await this.db.delete(moduleFields).where(eq(moduleFields.module_id, moduleId));
  }

  // ============================================================================
  // FIELD VALIDATIONS
  // ============================================================================

  /**
   * Create validation record
   */
  async createValidation(data: NewFieldValidation): Promise<FieldValidation> {
    const [validation] = await this.db
      .insert(fieldValidations)
      .values(data)
      .returning();
    return validation;
  }

  /**
   * Create multiple validations
   */
  async createValidations(data: NewFieldValidation[]): Promise<FieldValidation[]> {
    if (data.length === 0) return [];
    return this.db.insert(fieldValidations).values(data).returning();
  }

  /**
   * Find validations by field ID
   */
  async findValidationsByFieldId(fieldId: number): Promise<FieldValidation[]> {
    return this.db
      .select()
      .from(fieldValidations)
      .where(eq(fieldValidations.field_id, fieldId))
      .orderBy(fieldValidations.order);
  }

  /**
   * Delete validations by field ID
   */
  async deleteValidationsByFieldId(fieldId: number): Promise<void> {
    await this.db.delete(fieldValidations).where(eq(fieldValidations.field_id, fieldId));
  }

  // ============================================================================
  // GENERATION HISTORY
  // ============================================================================

  /**
   * Create history record
   */
  async createHistory(data: NewGenerationHistory): Promise<GenerationHistory> {
    const [history] = await this.db
      .insert(generationHistory)
      .values(data)
      .returning();
    return history;
  }

  /**
   * Find history by module ID
   */
  async findHistoryByModuleId(moduleId: number): Promise<GenerationHistory[]> {
    return this.db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.module_id, moduleId))
      .orderBy(desc(generationHistory.created_at));
  }

  /**
   * Find recent history
   */
  async findRecentHistory(limit = 20): Promise<GenerationHistory[]> {
    return this.db
      .select()
      .from(generationHistory)
      .orderBy(desc(generationHistory.created_at))
      .limit(limit);
  }

  /**
   * Find history by ID
   */
  async findHistoryById(id: number): Promise<GenerationHistory | null> {
    const [history] = await this.db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.id, id));

    return history || null;
  }

  /**
   * Count history records
   */
  async countHistory(successOnly = false): Promise<number> {
    const query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(generationHistory);

    if (successOnly) {
      query.where(eq(generationHistory.success, true));
    }

    const [result] = await query;
    return Number(result.count);
  }
}
