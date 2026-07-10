import { z } from 'zod';

/**
 * Zod schema untuk create user
 */
export const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password_hash: z.string(),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
  is_verified: z.boolean().default(false),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
