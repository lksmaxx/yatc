import { z } from 'zod';

export const CreateBoardSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
});

export type CreateBoardDto = z.infer<typeof CreateBoardSchema>;

export const UpdateBoardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export type UpdateBoardDto = z.infer<typeof UpdateBoardSchema>;
