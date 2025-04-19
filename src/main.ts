import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Registrar o filtro de exceções globalmente
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Registrar o interceptor de resposta globalmente
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
