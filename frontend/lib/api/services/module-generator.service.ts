/**
 * Module Generator API Service
 * Handles CRUD Builder UI API calls
 */

import { apiClient } from '../client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ValidationRuleDto {
  type: string;
  value?: any;
  message?: string;
}

export interface ModuleFieldDto {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: any;
  validations?: ValidationRuleDto[];
  order?: number;
}

export interface GenerateModuleDto {
  moduleName: string;
  displayName: string;
  description?: string;
  isTenantIsolated?: boolean;
  hasSoftDelete?: boolean;
  hasAudit?: boolean;
  searchableFields?: string[];
  filterableFields?: string[];
  sortableFields?: string[];
  fields: ModuleFieldDto[];
  uiConfig?: string | object; // UI/UX configuration
}

export interface UpdateModuleDto extends Partial<GenerateModuleDto> {
  fieldConfigurations?: string; // JSON string of field configurations (inputType, placeholder, helpText, validations)
}

export interface QueryModulesDto {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ModuleFieldResponse {
  id: number;
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: any;
  validations: any[];
  order: number;
}

export interface ModuleResponse {
  id: number;
  moduleName: string;
  displayName: string;
  description?: string;
  fieldsCount: number;
  permissionsCount: number;
  createdAt: string;
  createdBy?: {
    id: number;
    name?: string;
  };
}

export interface ModuleDetailResponse extends ModuleResponse {
  isTenantIsolated: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
  searchableFields?: string[];
  filterableFields?: string[];
  sortableFields?: string[];
  fields: ModuleFieldResponse[];
  updatedAt: string;
}

// ============================================================================
// Module Generator Service
// ============================================================================

export const moduleGeneratorService = {
  /**
   * Get all generated modules dengan pagination
   */
  async list(params?: QueryModulesDto): Promise<{
    data: ModuleResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await apiClient.get('/module-generator', { params: params as any });
  },

  /**
   * Get module detail by ID (includes fields)
   */
  async getById(id: number): Promise<ModuleDetailResponse> {
    return await apiClient.get<ModuleDetailResponse>(`/module-generator/${id}`);
  },

  /**
   * Generate new CRUD module
   */
  async generate(data: GenerateModuleDto): Promise<ModuleDetailResponse> {
    return await apiClient.post<ModuleDetailResponse>('/module-generator', data);
  },

  /**
   * Update module metadata
   */
  async update(id: number, data: UpdateModuleDto): Promise<ModuleDetailResponse> {
    return await apiClient.patch<ModuleDetailResponse>(`/module-generator/${id}`, data);
  },

  /**
   * Delete module (soft delete)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/module-generator/${id}`);
  },

  /**
   * Validate module name (check uniqueness)
   * Returns true if available, false if already exists
   */
  async validateName(moduleName: string): Promise<{ available: boolean; message?: string }> {
    try {
      // Check if module with this name exists
      const result: any = await apiClient.get('/module-generator', {
        params: { search: moduleName, limit: 1 } as any,
      });
      
      // If exact match found, name is not available
      const exactMatch = result.data.find(
        (m: ModuleResponse) => m.moduleName === moduleName
      );
      
      return {
        available: !exactMatch,
        message: exactMatch ? 'Module name sudah digunakan' : undefined,
      };
    } catch (error) {
      // If error, assume available (let backend validate)
      return { available: true };
    }
  },

  /**
   * Get all validation types (master data)
   */
  async getValidationTypes() {
    const response = await apiClient.get<any>('/module-generator/validation-types');
    return response.data;
  },

  /**
   * Get validation types for specific field type
   */
  async getValidationTypesForFieldType(fieldType: string) {
    const response = await apiClient.get<any>(`/module-generator/validation-types/${fieldType}`);
    return response.data;
  },
};
