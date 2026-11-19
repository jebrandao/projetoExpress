import { config } from './config/env.js';
import app from './app.js';

app.listen(config.porta, () => {
  console.log(`Servidor rodando em http://localhost:${config.porta} (perfil: ${config.perfil})`);
});
