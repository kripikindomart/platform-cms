'use client';

import { useState } from 'react';
import { moduleGeneratorService } from '@/lib/api/services/module-generator.service';
import { toast } from 'sonner';

export interface GenerateModuleDto {
  moduleName: string;
  displayName: string;
  description?: string;
  isTenantIsolated: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
  fields: ModuleField[];
  searchableFields: string[];
  filterableFields: string[];
  sortableFields: string[];
  uiConfig?: string | object; // UI/UX configuration
}

export interface ModuleField {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
  validations?: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  value?: any;
}

export interface QueryModulesDto {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ModuleListItem {
  id: number;
  moduleName: string;
  displayName: string;
  description?: string;
  fieldsCount: number;
  permissionsCount: number;
  createdAt: string;
  createdBy?: {
    id: number;
    name?: string; // Make name optional to match service
  };
}

export interface ModuleDetail extends ModuleListItem {
  isTenantIsolated: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
  searchableFields?: string[]; // Make optional to match service
  filterableFields?: string[]; // Make optional to match service
  sortableFields?: string[]; // Make optional to match service
  fields: ModuleField[];
  updatedAt?: string; // Add updatedAt
  uiConfig?: {
    createFormType?: 'page' | 'modal';
    editFormType?: 'page' | 'modal';
  } | string; // Can be object or JSON string
}

/**
 * Hook for Module Generator operations
 * Follows the same pattern as useRoles
 */
export function useModuleGenerator() {
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchModules = async (params?: QueryModulesDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await moduleGeneratorService.list(params);
      setModules(response.data);
      setPagination({
        page: response.page,
        perPage: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err as Error);
      toast.error('Gagal memuat data module');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleDetail = async (id: number): Promise<ModuleDetail | null> => {
    try {
      setLoading(true);
      setError(null);
      const module = await moduleGeneratorService.getById(id);
      return module;
    } catch (err) {
      setError(err as Error);
      toast.error('Gagal memuat detail module');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateModule = async (data: GenerateModuleDto) => {
    try {
      setLoading(true);
      const module = await moduleGeneratorService.generate(data);
      toast.success('Module berhasil di-generate!');
      return module;
    } catch (err: any) {
      // Parse validation errors from backend
      const messages = err?.response?.data?.message;
      
      if (Array.isArray(messages) && messages.length > 0) {
        // Show each validation error
        messages.forEach((msg: string) => {
          toast.error(msg, {
            duration: 5000,
          });
        });
      } else if (typeof messages === 'string') {
        toast.error(messages);
      } else {
        toast.error('Gagal generate module');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateModule = async (id: number, data: Partial<GenerateModuleDto>) => {
    try {
      setLoading(true);
      const module = await moduleGeneratorService.update(id, data);
      toast.success('Module metadata berhasil diupdate');
      return module;
    } catch (err) {
      toast.error('Gagal mengupdate module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteModule = async (id: number) => {
    try {
      setLoading(true);
      await moduleGeneratorService.delete(id);
      toast.success('Module berhasil dihapus');
      // Refresh list
      await fetchModules({ page: pagination.page, limit: pagination.perPage });
    } catch (err) {
      toast.error('Gagal menghapus module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateModuleName = async (name: string): Promise<boolean> => {
    try {
      const response = await moduleGeneratorService.validateName(name);
      return response.available;
    } catch (err) {
      console.error('Gagal validasi module name:', err);
      return false;
    }
  };

  return {
    modules,
    loading,
    error,
    pagination,
    fetchModules,
    fetchModuleDetail,
    generateModule,
    updateModule,
    deleteModule,
    validateModuleName,
  };
}
