import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Registrar o filtro de exceções globalmente
  app.useGlobalFilters(new HttpExceptionFilter());

  // Registrar o interceptor de resposta globalmente
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('YATC API')
    .setDescription('API para o Yet Another Trello Clone')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('boards', 'Endpoints de quadros')
    .addTag('lists', 'Endpoints de listas')
    .addTag('tasks', 'Endpoints de tarefas')
    .addTag('users', 'Endpoints de usuários')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
