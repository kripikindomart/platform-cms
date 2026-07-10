import { z } from 'zod';

/**
 * Create Tenant DTO Schema
 * Validation untuk create new tenant
 */
export const CreateTenantDtoSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama tenant minimal 2 karakter')
    .max(255, 'Nama tenant maksimal 255 karakter')
    .trim(),

  domain: z
    .string()
    .max(255, 'Domain maksimal 255 karakter')
    .regex(
      /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i,
      'Format domain tidak valid',
    )
    .optional(),

  subscriptionTier: z
    .enum(['free', 'basic', 'pro', 'enterprise'])
    .default('free'),

  config: z
    .object({
      branding: z
        .object({
          logo: z.string().url().optional(),
          primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
          secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        })
        .optional(),
      features: z
        .object({
          maxUsers: z.number().int().positive().optional(),
          maxStorage: z.number().int().positive().optional(),
          enabledFeatures: z.array(z.string()).optional(),
        })
        .optional(),
      limits: z
        .object({
          apiRateLimit: z.number().int().positive().optional(),
          storageLimit: z.number().int().positive().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type CreateTenantDto = z.infer<typeof CreateTenantDtoSchema>;
