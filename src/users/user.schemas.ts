import { create } from 'domain';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be at most 100 characters'),
});

export const updateUserSchema = createUserSchema.partial();

export const userSchema = createUserSchema.extend({
  id: z.number(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserDto = z.infer<typeof userSchema>;
