// Este arquivo é executado antes dos testes E2E
const path = require('path');
const dotenv = require('dotenv');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../tsconfig.json');

// Carrega as variáveis de ambiente do arquivo .env.test
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

// Define o ambiente como teste
process.env.NODE_ENV = 'test';
