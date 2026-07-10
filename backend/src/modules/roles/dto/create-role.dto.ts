import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-z0-9_-]+$/, 'Nama hanya boleh huruf kecil, angka, underscore, dan dash'),
  display_name: z.string().min(2, 'Display name minimal 2 karakter').max(255, 'Display name maksimal 255 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),
  is_system: z.boolean().default(false),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
