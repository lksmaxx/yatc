const path = require('path');
require('dotenv').config();

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Carregamento automático de entidades usando glob patterns
  entities: [
    path.join(__dirname, 'dist', '**', '*.entity.js'),
    path.join(__dirname, 'src', '**', '*.entity.ts'),
  ],
  migrations: [
    path.join(__dirname, 'dist', 'migrations', '*.js'),
    path.join(__dirname, 'src', 'migrations', '*.ts'),
  ],
  cli: {
    migrationsDir: 'src/migrations',
  },
  synchronize: false,
};
