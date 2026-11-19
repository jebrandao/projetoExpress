import { existsSync } from 'node:fs';

// O perfil ativo vem da variável NODE_ENV: development, test ou production
const perfil = process.env.NODE_ENV ?? 'development';

// Carrega o arquivo .env.<perfil> (se existir).
// Variáveis já definidas no sistema têm prioridade sobre as do arquivo.
const arquivo = `.env.${perfil}`;
if (existsSync(arquivo)) {
  process.loadEnvFile(arquivo);
}

// Todas as configurações da aplicação ficam reunidas neste objeto
export const config = {
  perfil,
  porta: Number(process.env.PORT ?? 3000),
  seed: process.env.SEED === 'true', // carrega dados de exemplo ao iniciar
  bd: {
    dialeto: process.env.DB_DIALECT ?? 'sqlite', // sqlite ou mysql
    arquivo: process.env.DB_STORAGE ?? ':memory:', // somente SQLite
    host: process.env.DB_HOST ?? 'localhost', // somente MySQL
    porta: Number(process.env.DB_PORT ?? 3306),
    nome: process.env.DB_NAME ?? 'db_api',
    usuario: process.env.DB_USER ?? 'root',
    senha: process.env.DB_PASSWORD ?? '',
    // force: recria as tabelas a cada início | alter: ajusta as tabelas | nenhuma: não mexe
    sincronizacao: process.env.DB_SYNC ?? 'nenhuma',
    log: process.env.DB_LOG === 'true',
  },
};
