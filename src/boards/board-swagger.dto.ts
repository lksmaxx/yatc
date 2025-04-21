import { ApiProperty } from '@nestjs/swagger';
import { ApiZodSchema } from '../common/utils/swagger.utils';
import { CreateBoardSchema, UpdateBoardSchema } from './board.schemas';

@ApiZodSchema(CreateBoardSchema)
export class CreateBoardSwaggerDto {
  @ApiProperty({ example: 'Meu Projeto', description: 'Título do quadro' })
  title: string;

  @ApiProperty({
    example: 'Quadro para gerenciar meu projeto pessoal',
    description: 'Descrição do quadro',
    required: false,
  })
  description?: string;
}

@ApiZodSchema(UpdateBoardSchema)
export class UpdateBoardSwaggerDto {
  @ApiProperty({
    example: 'Projeto Atualizado',
    description: 'Novo título do quadro',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Descrição atualizada',
    description: 'Nova descrição do quadro',
    required: false,
  })
  description?: string;
}

export class BoardResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Meu Projeto' })
  title: string;

  @ApiProperty({ example: 'Quadro para gerenciar meu projeto pessoal' })
  description: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  ownerId: string;

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  updatedAt: Date;
}

export class BoardListResponseDto {
  @ApiProperty({ type: [BoardResponseDto] })
  boards: BoardResponseDto[];
}
