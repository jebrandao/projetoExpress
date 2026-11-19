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
};
