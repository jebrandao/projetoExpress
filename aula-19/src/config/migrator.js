import { fileURLToPath, pathToFileURL } from 'node:url';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './database.js';

const pastaDasMigracoes = fileURLToPath(new URL('../migrations/', import.meta.url));

// O Umzug executa os arquivos da pasta src/migrations em ordem alfabética (001, 002, 003...)
// e registra na tabela "migracoes" quais já foram aplicadas, para não repeti-las.
export const umzug = new Umzug({
  migrations: {
    glob: ['*.js', { cwd: pastaDasMigracoes }],
    resolve: ({ name, path, context }) => {
      const carregar = () => import(pathToFileURL(path).href);
      return {
        name,
        up: async () => (await carregar()).up({ context }),
        down: async () => (await carregar()).down({ context }),
      };
    },
  },
  context: sequelize.getQueryInterface(), // é o objeto usado para criar e alterar tabelas
  storage: new SequelizeStorage({ sequelize, tableName: 'migracoes' }),
  // Uma linha por evento (migrating, migrated, reverting, reverted)
  logger: {
    info: (evento) => console.info('[migração]', evento.event, evento.name),
    warn: console.warn,
    error: console.error,
    debug: () => {},
  },
});

// Aplica todas as migrações pendentes
export async function migrar() {
  return umzug.up();
}
