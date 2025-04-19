import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: ['dist/**/*.entity{.ts,.js}'],
          migrations: ['dist/migrations/*{.ts,.js}'],
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
    UsersModule,
    TasksModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
