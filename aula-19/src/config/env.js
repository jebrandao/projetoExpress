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
    log: process.env.DB_LOG === 'true',
  },
  jwt: {
    // A chave secreta assina e valida os tokens. Vem de configuração, nunca do código.
    segredo: process.env.JWT_SECRET ?? '',
    expiracaoEmSegundos: Number(process.env.JWT_EXPIRACAO_SEGUNDOS ?? 3600),
  },
  cors: {
    // Origens (sites) autorizadas a chamar a API pelo navegador, separadas por vírgula
    origens: (process.env.CORS_ORIGENS ?? '').split(',').map((o) => o.trim()).filter(Boolean),
  },
};

// Falhar logo ao iniciar é melhor do que rodar com uma chave fraca ou conhecida
if (config.jwt.segredo.length < 32) {
  throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres (defina no arquivo .env do perfil)');
}
