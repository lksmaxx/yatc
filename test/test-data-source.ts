import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

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
  // Carregamento automático de entidades usando glob patterns
  entities: [path.join(__dirname, '..', 'src', '**', '*.entity.ts')],
  migrations: [path.join(__dirname, '..', 'src', 'migrations', '*.ts')],
  dropSchema: true, // Limpa o banco de dados antes dos testes
  logging: true,
};

// Cria a instância do DataSource
const testDataSource = new DataSource(testDataSourceOptions);

export default testDataSource;
