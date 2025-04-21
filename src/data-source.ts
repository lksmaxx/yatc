import { DataSource } from 'typeorm';
import 'dotenv/config';
import { join } from 'path';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Carregamento automático de entidades usando glob patterns
  entities: [
    join(__dirname, '**', '*.entity.ts'),
    join(__dirname, '**', '*.entity.js'),
    join(__dirname, '..', 'src', '**', '*.entity.ts'),
    join(__dirname, '..', 'dist', '**', '*.entity.js'),
  ],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
