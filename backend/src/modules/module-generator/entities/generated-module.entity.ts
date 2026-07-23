/**
 * Visual Module Entity
 * Re-export dari public schema untuk use di module-generator service/repository
 * 
 * Entity ini menyimpan metadata module yang di-generate via Visual Module Builder UI.
 * Stored di PUBLIC schema (global, not tenant-isolated)
 */
export { 
  visualModules as generatedModules,
  type VisualModule as GeneratedModule,
  type NewVisualModule as NewGeneratedModule,
} from '../../../database/schema/public/visual-modules.schema';
