import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginSchema,
  RegisterDto,
  RegisterSchema,
} from './dto/auth.dto';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';

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
