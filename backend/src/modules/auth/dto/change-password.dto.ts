import { z } from 'zod';

/**
 * Password validation schema
 */
const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka');

/**
 * Zod schema untuk change password
 */
export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Password lama wajib diisi'),
  new_password: passwordSchema,
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
