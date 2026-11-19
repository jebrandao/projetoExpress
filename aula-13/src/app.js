import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { logger } from './middleware/logger.js';
import { naoEncontrado } from './middleware/nao-encontrado.js';
import { tratadorDeErros } from './middleware/tratador-de-erros.js';
import estudanteResource from './resource/estudante.resource.js';
import professorResource from './resource/professor.resource.js';
import turmaResource from './resource/turma.resource.js';

// O "app" reúne as rotas e os middlewares da API.
// Ele não escuta porta nenhuma: quem faz isso é o server.js
const app = express();

// A ORDEM importa: a requisição passa pelos middlewares de cima para baixo
app.use(express.json()); // converte o corpo JSON em objeto (req.body)
app.use(logger);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Escola no ar!', perfil: config.perfil, documentacao: '/api-docs' });
});

// Documentação interativa (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/estudantes', estudanteResource);
app.use('/professores', professorResource);
app.use('/turmas', turmaResource);

app.use(naoEncontrado); // nenhuma rota respondeu
app.use(tratadorDeErros); // por último: monta a resposta de todos os erros

export default app;
