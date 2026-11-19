// Executa uma consulta SQL no banco do perfil ativo e mostra o resultado em uma tabela.
// Uso:  npm run bd -- "SELECT * FROM estudante"
import { QueryTypes } from 'sequelize';
import { sequelize } from '../src/config/database.js';

const sql = process.argv[2];

if (!sql) {
  console.error('Informe a consulta. Exemplo: npm run bd -- "SELECT * FROM estudante"');
  process.exit(1);
}

try {
  const linhas = await sequelize.query(sql, { type: QueryTypes.SELECT });
  console.table(linhas);
} finally {
  await sequelize.close();
}
