import { z } from 'zod';

// Schema para validação dos dados de registro
export const RegisterSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
});

// Schema para validação dos dados de login
export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

// Tipos inferidos dos schemas
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
