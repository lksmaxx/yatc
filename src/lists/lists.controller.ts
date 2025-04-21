import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import {
  CreateListDto,
  UpdateListDto,
  MoveListDto,
  CreateListSchema,
  UpdateListSchema,
  MoveListSchema,
} from './list.schemas';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateListSwaggerDto,
  ListResponseDto,
  MoveListSwaggerDto,
  UpdateListSwaggerDto,
} from './list-swagger.dto';

@ApiTags('lists')
@ApiBearerAuth()
@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas as listas',
    description: 'Retorna todas as listas de um quadro específico',
  })
  @ApiQuery({
    name: 'boardId',
    description: 'ID do quadro',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de listas retornada com sucesso',
    type: [ListResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao quadro' })
  findAll(@Query('boardId') boardId: string, @CurrentUser() user: User) {
    return this.listsService.findAll(boardId, user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar uma lista',
    description: 'Retorna uma lista específica pelo ID',
  })
  @ApiParam({ name: 'id', description: 'ID da lista' })
  @ApiResponse({
    status: 200,
    description: 'Lista encontrada com sucesso',
    type: ListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à lista' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar uma lista',
    description: 'Cria uma nova lista em um quadro',
  })
  @ApiBody({ type: CreateListSwaggerDto })
  @ApiResponse({
    status: 201,
    description: 'Lista criada com sucesso',
    type: ListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao quadro' })
  create(
    @Body(new ZodValidator(CreateListSchema)) createListDto: CreateListDto,
    @CurrentUser() user: User,
  ) {
    return this.listsService.create(createListDto, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma lista',
    description: 'Atualiza uma lista existente',
  })
  @ApiParam({ name: 'id', description: 'ID da lista' })
  @ApiBody({ type: UpdateListSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Lista atualizada com sucesso',
    type: ListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à lista' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidator(UpdateListSchema)) updateListDto: UpdateListDto,
    @CurrentUser() user: User,
  ) {
    return this.listsService.update(id, updateListDto, user.id);
  }

  @Patch(':id/move')
  @ApiOperation({
    summary: 'Mover uma lista',
    description: 'Atualiza a posição de uma lista existente',
  })
  @ApiParam({ name: 'id', description: 'ID da lista' })
  @ApiBody({ type: MoveListSwaggerDto })
  @ApiResponse({
    status: 200,
    description: 'Lista movida com sucesso',
    type: ListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à lista' })
  move(
    @Param('id') id: string,
    @Body(new ZodValidator(MoveListSchema)) moveListDto: MoveListDto,
    @CurrentUser() user: User,
  ) {
    return this.listsService.move(id, moveListDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir uma lista',
    description: 'Exclui uma lista existente',
  })
  @ApiParam({ name: 'id', description: 'ID da lista' })
  @ApiResponse({ status: 200, description: 'Lista excluída com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à lista' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.remove(id, user.id);
  }
}
