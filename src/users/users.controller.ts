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
import { UsersService } from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  CreateUserDto,
  UpdateUserDto,
} from './user.schemas';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserSwaggerDto, UserResponseDto } from './user-swagger.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna todos os usuários cadastrados no sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Endpoint para buscar o usuário logado
   * @returns Dados do usuário autenticado
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Get('me')
  @ApiOperation({
    summary: 'Obter perfil do usuário',
    description: 'Retorna os dados do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um usuário',
    description:
      'Cria um novo usuário manualmente (funcionalidade administrativa)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'E-mail já está em uso' })
  create(
    @Body(new ZodValidator(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Atualizar perfil',
    description: 'Atualiza os dados do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  updateCurrentUser(
    @Body(new ZodValidator(updateUserSchema)) updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Excluir conta',
    description: 'Exclui a conta do usuário autenticado',
  })
  @ApiResponse({ status: 200, description: 'Conta excluída com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  removeCurrentUser(@CurrentUser() user: User) {
    return this.usersService.remove(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um usuário pelo ID',
    description: 'Retorna os dados de um usuário específico pelo ID',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um usuário pelo ID',
    description:
      'Atualiza os dados de um usuário específico pelo ID (funcionalidade administrativa)',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  updateById(
    @Param('id') id: string,
    @Body(new ZodValidator(updateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir um usuário pelo ID',
    description:
      'Exclui um usuário específico pelo ID (funcionalidade administrativa)',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário excluído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  removeById(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
