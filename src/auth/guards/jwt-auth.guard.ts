import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para proteger rotas que requerem autenticação.
 * Estende o AuthGuard do Passport com a estratégia 'jwt'.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
