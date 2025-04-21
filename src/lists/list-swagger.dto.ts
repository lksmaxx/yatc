import { ApiProperty } from '@nestjs/swagger';
import { ApiZodSchema } from '../common/utils/swagger.utils';
import {
  CreateListSchema,
  MoveListSchema,
  UpdateListSchema,
} from './list.schemas';

@ApiZodSchema(CreateListSchema)
export class CreateListSwaggerDto {
  @ApiProperty({ example: 'Tarefas Pendentes', description: 'Título da lista' })
  title: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do quadro ao qual a lista pertence',
  })
  boardId: string;

  @ApiProperty({
    example: 1,
    description: 'Posição da lista no quadro (opcional)',
    required: false,
  })
  position?: number;
}

@ApiZodSchema(UpdateListSchema)
export class UpdateListSwaggerDto {
  @ApiProperty({
    example: 'Tarefas Em Progresso',
    description: 'Novo título da lista',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 2,
    description: 'Nova posição da lista',
    required: false,
  })
  position?: number;
}

@ApiZodSchema(MoveListSchema)
export class MoveListSwaggerDto {
  @ApiProperty({ example: 3, description: 'Nova posição da lista' })
  position: number;
}

export class ListResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  id: string;

  @ApiProperty({ example: 'Tarefas Pendentes' })
  title: string;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Meu Projeto',
      ownerId: '123e4567-e89b-12d3-a456-426614174001',
    },
  })
  board: {
    id: string;
    title: string;
    ownerId: string;
  };

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  updatedAt: Date;
}
