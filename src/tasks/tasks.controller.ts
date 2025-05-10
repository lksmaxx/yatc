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
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from './task.schemas';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateTaskSwaggerDto,
  MoveTaskSwaggerDto,
  TaskResponseDto,
  UpdateTaskSwaggerDto,
  TaskPriorityEnum,
} from './task-swagger.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas as tarefas',
    description: 'Retorna todas as tarefas de uma lista específica',
  })
  @ApiQuery({
    name: 'listId',
    description: 'ID da lista',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas retornada com sucesso',
    type: [TaskResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à lista' })
  findAll(@Query('listId') listId: string, @CurrentUser() user: User) {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar uma tarefa',
    description: 'Retorna uma tarefa específica pelo ID',
  })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa encontrada com sucesso',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à tarefa' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar uma tarefa',
    description: 'Cria uma nova tarefa em uma lista',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Lista não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à lista' })
  create(
    @Body(new ZodValidator(createTaskSchema)) createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.create(createTaskDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma tarefa',
    description: 'Atualiza uma tarefa existente',
  })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à tarefa' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidator(updateTaskSchema)) updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/move')
  @ApiOperation({
    summary: 'Mover uma tarefa',
    description: 'Mover uma tarefa para uma lista diferente',
  })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa movida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à tarefa' })
  move(
    @Param('id') id: string,
    @Body(new ZodValidator(moveTaskSchema)) moveTaskDto: MoveTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.moveTask(id, moveTaskDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir uma tarefa',
    description: 'Exclui uma tarefa existente',
  })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa excluída com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado à tarefa' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id);
  }
}
