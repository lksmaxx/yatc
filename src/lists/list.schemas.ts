import { z } from 'zod';

export const CreateListSchema = z.object({
  title: z.string().min(1).max(100),
  boardId: z.string().uuid(),
  position: z.number().int().nonnegative().optional(),
});

export type CreateListDto = z.infer<typeof CreateListSchema>;

export const UpdateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  position: z.number().int().nonnegative().optional(),
});

export type UpdateListDto = z.infer<typeof UpdateListSchema>;

export const MoveListSchema = z.object({
  position: z.number().int().nonnegative(),
});

export type MoveListDto = z.infer<typeof MoveListSchema>;

export const ListSearchSchema = z.object({
  title: z.string().optional(),
  boardId: z.string().uuid().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  userId: z.string().optional(),
});

export type ListSearchDto = z.infer<typeof ListSearchSchema>;
