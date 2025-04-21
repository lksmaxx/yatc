import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { TasksModule } from '../src/tasks/tasks.module';
import { BoardsModule } from '../src/boards/boards.module';
import { ListsModule } from '../src/lists/lists.module';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { testDataSourceOptions } from './test-data-source';

// Este módulo é criado especificamente para os testes E2E
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), '.env.test'),
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...testDataSourceOptions,
      autoLoadEntities: true, // Carrega entidades automaticamente dos módulos importados
    }),
    UsersModule,
    TasksModule,
    BoardsModule, // Importante importar para que as entidades sejam reconhecidas
    ListsModule, // Importante importar para que as entidades sejam reconhecidas
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestModule {}
