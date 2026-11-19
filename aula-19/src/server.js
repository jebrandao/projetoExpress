import { config } from './config/env.js';
import { migrar } from './config/migrator.js';
import { iniciarDados } from './inicializacao/init.js';
import './models/index.js'; // registra os models e seus relacionamentos
import app from './app.js';

// Aplica as migrações pendentes: é o que cria e evolui as tabelas
await migrar();

// Dados de exemplo (controlados pela variável SEED do perfil)
if (config.seed) {
  await iniciarDados();
}

app.listen(config.porta, () => {
  console.log(`Servidor rodando em http://localhost:${config.porta} (perfil: ${config.perfil})`);
});
