import { config } from './config/env.js';
import { sincronizar } from './config/database.js';
import { iniciarDados } from './inicializacao/init.js';
import './models/index.js'; // registra os models antes de sincronizar
import app from './app.js';

// Cria/ajusta as tabelas conforme o perfil (DB_SYNC)
await sincronizar();

// Dados de exemplo (controlados pela variável SEED do perfil)
if (config.seed) {
  await iniciarDados();
}

app.listen(config.porta, () => {
  console.log(`Servidor rodando em http://localhost:${config.porta} (perfil: ${config.perfil})`);
});
