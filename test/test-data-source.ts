import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { User } from '../src/users/user.entity';
import { Task } from '../src/tasks/task.entity';

// Carregando variáveis de ambiente
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

// Configuração para o banco de dados de teste
export const testDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT ?? '5432', 10),
  username: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_NAME || 'yatc_test',
  entities: [User, Task], // Definindo explicitamente as entidades
  synchronize: true, // Cuidado: em produção deve ser false
  dropSchema: true, // Limpa o banco de dados antes dos testes
  logging: false,
};

// Cria a instância do DataSource
const testDataSource = new DataSource(testDataSourceOptions);

export default testDataSource;
