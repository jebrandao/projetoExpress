import { config } from './config/env.js';
import { sequelize } from './models/index.js';
import { iniciarDados } from './inicializacao/init.js';
import app from './app.js';

// sync() cria as tabelas que ainda não existem, a partir dos models
await sequelize.sync();

// Dados de exemplo (controlados pela variável SEED do perfil)
if (config.seed) {
  await iniciarDados();
}

app.listen(config.porta, () => {
  console.log(`Servidor rodando em http://localhost:${config.porta} (perfil: ${config.perfil})`);
});
