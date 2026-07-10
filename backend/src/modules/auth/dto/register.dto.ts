import { z } from 'zod';

/**
 * Password validation schema
 * - Min 8 characters
 * - At least 1 uppercase
 * - At least 1 lowercase
 * - At least 1 number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka');

/**
 * Zod schema untuk register
 */
export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: passwordSchema,
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  phone: z.string().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
