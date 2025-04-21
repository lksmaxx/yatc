import { ApiProperty } from '@nestjs/swagger';
import { ApiZodSchema } from '../common/utils/swagger.utils';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from './task.schemas';

export enum TaskPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@ApiZodSchema(createTaskSchema)
export class CreateTaskSwaggerDto {
  @ApiProperty({
    example: 'Implementar documentação Swagger',
    description: 'Título da tarefa',
  })
  title: string;

  @ApiProperty({
    example: 'Adicionar documentação Swagger ao projeto YATC',
    description: 'Descrição da tarefa',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'ID da lista à qual a tarefa pertence',
  })
  listId: string;

  @ApiProperty({
    enum: TaskPriorityEnum,
    example: 'MEDIUM',
    description: 'Prioridade da tarefa',
    required: false,
  })
  priority?: string;

  @ApiProperty({
    example: 1,
    description: 'Posição da tarefa na lista (opcional)',
    required: false,
  })
  position?: number;
}

@ApiZodSchema(updateTaskSchema)
export class UpdateTaskSwaggerDto {
  @ApiProperty({
    example: 'Implementar documentação Swagger V2',
    description: 'Novo título da tarefa',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Descrição atualizada da tarefa',
    description: 'Nova descrição da tarefa',
    required: false,
  })
  description?: string;

  @ApiProperty({
    enum: TaskPriorityEnum,
    example: 'HIGH',
    description: 'Nova prioridade da tarefa',
    required: false,
  })
  priority?: string;
}

@ApiZodSchema(moveTaskSchema)
export class MoveTaskSwaggerDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174003',
    description: 'ID da nova lista',
    required: false,
  })
  listId?: string;

  @ApiProperty({ example: 2, description: 'Nova posição da tarefa' })
  position: number;
}

export class TaskResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174004' })
  id: string;

  @ApiProperty({ example: 'Implementar documentação Swagger' })
  title: string;

  @ApiProperty({ example: 'Adicionar documentação Swagger ao projeto YATC' })
  description: string;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ enum: TaskPriorityEnum, example: 'MEDIUM' })
  priority: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174002',
      title: 'Tarefas Pendentes',
    },
  })
  list: {
    id: string;
    title: string;
  };

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  updatedAt: Date;
}
