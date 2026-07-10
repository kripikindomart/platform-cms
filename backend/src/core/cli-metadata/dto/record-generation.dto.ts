/**
 * Record Generation DTO
 * For recording CLI operations in history
 */

import { z } from 'zod';

export const RecordGenerationSchema = z.object({
  operation: z.enum(['generate', 'update', 'delete']),
  moduleId: z.number().int().optional(),
  command: z.string(),
  options: z.record(z.string(), z.any()).optional(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  filesCreated: z.array(z.string()).optional(),
  filesModified: z.array(z.string()).optional(),
  filesDeleted: z.array(z.string()).optional(),
  canRollback: z.boolean().default(true),
  rollbackData: z.record(z.string(), z.any()).optional(),
  createdBy: z.number().int().optional(),
});

export type RecordGenerationDto = z.infer<typeof RecordGenerationSchema>;
