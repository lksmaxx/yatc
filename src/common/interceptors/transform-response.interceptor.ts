import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        // Verificamos se é uma resposta de sucesso (código 2xx)
        const isSuccessResponse = statusCode >= 200 && statusCode < 300;

        // Só aplicamos a transformação em respostas de sucesso
        if (
          isSuccessResponse &&
          data === undefined &&
          statusCode !== HttpStatus.NO_CONTENT
        ) {
          return { success: true };
        }

        // Caso contrário, retornamos os dados originais
        return data;
      }),
    );
  }
}
