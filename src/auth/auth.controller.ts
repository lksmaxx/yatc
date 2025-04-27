import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginSchema,
  RegisterDto,
  RegisterSchema,
} from './dto/auth.dto';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para autenticação de usuários.
   * @param loginDto Dados de login (email e senha)
   * @returns Token JWT e informações do usuário
   */
  @Post('login')
  login(@Body(new ZodValidator(LoginSchema)) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  /**
   * Endpoint para obter informações do usuário autenticado.
   * @returns Dados do usuário autenticado
   */
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) {
    return this.authService.me(user);
  }

  /**
   * Endpoint para registro de novos usuários.
   * @param registerDto Dados de registro (nome, email e senha)
   * @returns Token JWT e informações do usuário criado
   */
  @Post('register')
  register(@Body(new ZodValidator(RegisterSchema)) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
