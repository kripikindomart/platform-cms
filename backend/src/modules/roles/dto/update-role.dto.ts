import { z } from 'zod';

export const updateRoleSchema = z.object({
  display_name: z.string().min(2, 'Display name minimal 2 karakter').max(255, 'Display name maksimal 255 karakter').optional(),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),
});

export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
