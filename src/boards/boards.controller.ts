import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateBoardSchema,
  UpdateBoardSchema,
} from './board.schemas';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BoardResponseDto,
  CreateBoardSwaggerDto,
  UpdateBoardSwaggerDto,
} from './board-swagger.dto';

@ApiTags('boards')
@ApiBearerAuth()
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os quadros',
    description: 'Retorna todos os quadros do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de quadros retornada com sucesso',
    type: [BoardResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@CurrentUser() user: User) {
    return this.boardsService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um quadro',
    description: 'Retorna um quadro específico pelo ID',
  })
  @ApiParam({ name: 'id', description: 'ID do quadro' })
  @ApiResponse({
    status: 200,
    description: 'Quadro encontrado com sucesso',
    type: BoardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao quadro' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.boardsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um quadro',
    description: 'Cria um novo quadro',
  })
  @ApiResponse({
    status: 201,
    description: 'Quadro criado com sucesso',
    type: BoardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(
    @Body(new ZodValidator(CreateBoardSchema)) createBoardDto: CreateBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.boardsService.create(createBoardDto, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um quadro',
    description: 'Atualiza um quadro existente',
  })
  @ApiParam({ name: 'id', description: 'ID do quadro' })
  @ApiResponse({
    status: 200,
    description: 'Quadro atualizado com sucesso',
    type: BoardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao quadro' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidator(UpdateBoardSchema)) updateBoardDto: UpdateBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.boardsService.update(id, updateBoardDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir um quadro',
    description: 'Exclui um quadro existente',
  })
  @ApiParam({ name: 'id', description: 'ID do quadro' })
  @ApiResponse({ status: 200, description: 'Quadro excluído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao quadro' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.boardsService.remove(id, user.id);
  }
}
