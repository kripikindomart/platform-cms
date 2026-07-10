import { z } from 'zod';

export const assignPermissionsSchema = z.object({
  permission_ids: z.array(z.number().int().positive('Permission ID harus bilangan positif')).min(1, 'Minimal 1 permission'),
});

export type AssignPermissionsDto = z.infer<typeof assignPermissionsSchema>;
