import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import testDataSource from '../test/test-data-source';

// Carrega variáveis de ambiente do arquivo .env.test
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

const {
  TEST_DB_HOST = 'localhost',
  TEST_DB_PORT = '5432',
  TEST_DB_USER = 'postgres',
  TEST_DB_PASSWORD = 'postgres',
  TEST_DB_NAME = 'yatc_test',
} = process.env;

async function createTestDatabase() {
  console.log('🔧 Preparando banco de dados para testes...');

  // Conecta ao servidor postgres para criar o banco de dados de teste se não existir
  const client = new Client({
    host: TEST_DB_HOST,
    port: parseInt(TEST_DB_PORT, 10),
    user: TEST_DB_USER,
    password: TEST_DB_PASSWORD,
    database: 'postgres', // Conecta ao banco postgres padrão primeiro
  });

  try {
    await client.connect();

    // Verifica se o banco de dados de teste já existe
    const checkDbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${TEST_DB_NAME}'`,
    );

    // Se o banco de dados de teste não existir, cria-o
    if (checkDbResult.rowCount === 0) {
      console.log(`📦 Criando banco de dados de teste: ${TEST_DB_NAME}`);
      await client.query(`CREATE DATABASE ${TEST_DB_NAME}`);
      console.log('✅ Banco de dados de teste criado com sucesso!');
    } else {
      console.log(`📊 Banco de dados de teste ${TEST_DB_NAME} já existe.`);
    }
  } catch (error) {
    console.error('❌ Erro ao preparar banco de dados de teste:', error);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Inicializa o banco de dados de teste usando o TypeORM
  try {
    console.log('🔄 Inicializando esquema do banco de dados de teste...');

    // Inicializa a conexão com o banco de dados de teste
    await testDataSource.initialize();

    console.log(
      '✅ Schema do banco de dados de teste inicializado com sucesso!',
    );

    // Fecha a conexão
    await testDataSource.destroy();
  } catch (error) {
    console.error(
      '❌ Erro ao inicializar esquema do banco de dados de teste:',
      error,
    );
    process.exit(1);
  }
}

// Executa a função principal
createTestDatabase()
  .then(() => {
    console.log('✅ Banco de dados de teste preparado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao preparar banco de dados de teste:', error);
    process.exit(1);
  });
