import { z } from 'zod';

/**
 * Zod schema untuk login
 */
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type LoginDto = z.infer<typeof loginSchema>;
