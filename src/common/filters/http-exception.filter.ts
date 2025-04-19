import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] = [];
    let code = 'INTERNAL_ERROR';

    // Tratamento de erros HTTP conhecidos do NestJS
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const exceptionResponseObj = exceptionResponse as any;
        message = exceptionResponseObj.message || message;
        code = this.getErrorCode(statusCode);
        
        if (exceptionResponseObj.errors) {
          errors = exceptionResponseObj.errors;
        } else if (Array.isArray(exceptionResponseObj.message)) {
          errors = exceptionResponseObj.message.map(msg => ({
            message: msg
          }));
          message = 'Validation failed';
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCode(statusCode);
      }
    } 
    // Tratamento específico para erros de validação do Zod
    else if (exception instanceof ZodError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      code = 'VALIDATION_ERROR';
      errors = exception.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
    }
    // Tratamento de erros do TypeORM
    else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      code = 'DATABASE_ERROR';
      
      // Detecção de violações de chave única (duplicados)
      const errorDetail = (exception as any).detail;
      if (errorDetail && errorDetail.includes('already exists')) {
        message = 'A record with this data already exists';
        code = 'DUPLICATE_ENTRY';
      }
    }
    // Entidade não encontrada
    else if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      code = 'NOT_FOUND';
    }

    // Log detalhado do erro para debug (apenas em ambiente de desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Exception:', exception);
    } else {
      // Em produção, log mais limitado para evitar vazar dados sensíveis
      console.error(`[${code}] ${message} - ${request.method} ${request.url}`);
    }

    // Estrutura de resposta padronizada
    response.status(statusCode).json({
      statusCode,
      code,
      message,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}