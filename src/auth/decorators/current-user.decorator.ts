import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador que extrai o usuário da requisição.
 * Usado para obter o usuário autenticado em controllers.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
