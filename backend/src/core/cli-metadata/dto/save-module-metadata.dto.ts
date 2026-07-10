/**
 * Save Module Metadata DTO
 * For CLI to save generated module metadata
 */

import { z } from 'zod';

export const SaveValidationMetadataSchema = z.object({
  validationType: z.string(),
  validationParams: z.record(z.string(), z.any()).optional(),
  errorMessage: z.string().optional(),
  order: z.number().int().default(0),
});

export const SaveFieldMetadataSchema = z.object({
  name: z.string().min(1).max(255),
  displayName: z.string().min(1).max(255),
  description: z.string().optional(),
  fieldType: z.string(),
  isRequired: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  isNullable: z.boolean().default(true),
  defaultValue: z.string().optional(),
  length: z.number().int().optional(),
  precision: z.number().int().optional(),
  scale: z.number().int().optional(),
  enumValues: z.array(z.string()).optional(),
  relationModule: z.string().optional(),
  relationType: z.string().optional(),
  inputType: z.string(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  isSearchable: z.boolean().default(false),
  isSortable: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  showInList: z.boolean().default(true),
  showInDetail: z.boolean().default(true),
  showInForm: z.boolean().default(true),
  order: z.number().int().default(0),
  validations: z.array(SaveValidationMetadataSchema).default([]),
});

export const SaveModuleMetadataSchema = z.object({
  name: z.string().min(1).max(255),
  displayName: z.string().min(1).max(255),
  description: z.string().optional(),
  hasTenantIsolation: z.boolean().default(false),
  hasSoftDelete: z.boolean().default(false),
  hasAudit: z.boolean().default(false),
  generatedFiles: z.array(z.string()),
  cliCommand: z.string(),
  generatorVersion: z.string(),
  fields: z.array(SaveFieldMetadataSchema).default([]),
  createdBy: z.number().int().optional(),
});

export type SaveModuleMetadataDto = z.infer<typeof SaveModuleMetadataSchema>;
export type SaveFieldMetadataDto = z.infer<typeof SaveFieldMetadataSchema>;
export type SaveValidationMetadataDto = z.infer<typeof SaveValidationMetadataSchema>;
