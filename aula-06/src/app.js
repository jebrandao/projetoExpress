import express from 'express';
import { config } from './config/env.js';
import { logger } from './middleware/logger.js';
import { naoEncontrado } from './middleware/nao-encontrado.js';
import estudanteResource from './resource/estudante.resource.js';

// O "app" reúne as rotas e os middlewares da API.
// Ele não escuta porta nenhuma: quem faz isso é o server.js
const app = express();

// A ORDEM importa: a requisição passa pelos middlewares de cima para baixo
app.use(express.json()); // converte o corpo JSON em objeto (req.body)
app.use(logger);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Escola no ar!', perfil: config.perfil });
});

app.use('/estudantes', estudanteResource);

app.use(naoEncontrado); // por último: nenhuma rota respondeu

export default app;
