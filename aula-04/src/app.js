import express from 'express';
import { config } from './config/env.js';

// O "app" reúne as rotas e os middlewares da API.
// Ele não escuta porta nenhuma: quem faz isso é o server.js
const app = express();

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Escola no ar!', perfil: config.perfil });
});

export default app;
