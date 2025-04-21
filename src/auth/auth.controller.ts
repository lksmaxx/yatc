import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginSchema,
  RegisterDto,
  RegisterSchema,
} from './dto/auth.dto';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthResponseDto,
  LoginSwaggerDto,
  RegisterSwaggerDto,
} from './dto/auth-swagger.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para autenticação de usuários.
   * @param loginDto Dados de login (email e senha)
   * @returns Token JWT e informações do usuário
   */
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Autentica um usuário e retorna um token JWT',
  })
  @ApiResponse({
    status: 201,
    description: 'Login bem sucedido',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint para registro de novos usuários.
   * @param registerDto Dados de registro (nome, email e senha)
   * @returns Token JWT e informações do usuário criado
   */
  @Post('register')
  @ApiOperation({
    summary: 'Registrar usuário',
    description: 'Registra um novo usuário no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'E-mail já está em uso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
