import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: z.string().optional(),
  status: z
    .enum(['pending', 'in_progress', 'completed', 'cancelled'])
    .default('pending'),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters')
    .optional(),
  description: z.string().optional(),
  status: z
    .enum(['pending', 'in_progress', 'completed', 'cancelled'])
    .optional(),
  dueDate: z.string().datetime().optional(),
});

export const moveTaskSchema = z.object({
  listId: z.string().uuid().optional(),
  position: z.number().int().nonnegative(),
  priority: z.number().int().nonnegative().optional(),
});

export const taskSchema = createTaskSchema.extend({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type MoveTaskDto = z.infer<typeof moveTaskSchema>;
export type TaskDto = z.infer<typeof taskSchema>;
