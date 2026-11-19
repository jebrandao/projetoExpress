// Gerencia as migrações pelo terminal.
//   npm run migrar            aplica as migrações pendentes
//   npm run migrar:status     mostra quais já foram aplicadas e quais estão pendentes
//   npm run migrar:desfazer   desfaz a última migração aplicada
import { umzug } from '../src/config/migrator.js';
import { sequelize } from '../src/config/database.js';

const comando = process.argv[2] ?? 'subir';

try {
  if (comando === 'subir') {
    await umzug.up();
  } else if (comando === 'desfazer') {
    await umzug.down(); // desfaz somente a última
  } else if (comando === 'status') {
    const aplicadas = await umzug.executed();
    const pendentes = await umzug.pending();
    console.table([
      ...aplicadas.map((m) => ({ migracao: m.name, situacao: 'aplicada' })),
      ...pendentes.map((m) => ({ migracao: m.name, situacao: 'pendente' })),
    ]);
  } else {
    console.error(`Comando desconhecido: ${comando}`);
    process.exitCode = 1;
  }
} finally {
  await sequelize.close();
}
