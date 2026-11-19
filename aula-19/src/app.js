import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { logger } from './middleware/logger.js';
import { naoEncontrado } from './middleware/nao-encontrado.js';
import { tratadorDeErros } from './middleware/tratador-de-erros.js';
import { autenticar, exigirAutoridade, regrasPorMetodo } from './security/jwt-auth.js';
import { registrarUsuarioNoContexto } from './security/contexto-usuario.js';
import authResource from './resource/auth.resource.js';
import usuarioResource from './resource/usuario.resource.js';
import estudanteResource from './resource/estudante.resource.js';
import professorResource from './resource/professor.resource.js';
import turmaResource from './resource/turma.resource.js';

// O "app" reúne as rotas e os middlewares da API.
// Ele não escuta porta nenhuma: quem faz isso é o server.js
const app = express();

// CORS: autoriza sites de outras origens (ex.: um front-end em localhost:5173) a chamar a API.
// Vem ANTES da autenticação, porque o navegador faz uma requisição de "preflight" (OPTIONS)
// sem credenciais para perguntar o que é permitido.
app.use(
  cors({
    origin: config.cors.origens,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 3600,
  }),
);

// A ORDEM importa: a requisição passa pelos middlewares de cima para baixo
app.use(express.json()); // converte o corpo JSON em objeto (req.body)
app.use(logger);

// ---------- Rotas públicas
app.get('/', (req, res) => {
  res.json({ mensagem: 'API Escola no ar!', perfil: config.perfil, documentacao: '/api-docs' });
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger UI
app.use('/auth', authResource); // login e auto-cadastro

// ---------- A partir daqui tudo exige um token JWT válido
app.use(autenticar);
app.use(registrarUsuarioNoContexto); // a auditoria passa a saber quem está gravando

app.use('/usuarios', exigirAutoridade('USUARIOS'), usuarioResource);

// Leitura exige a permissão LEITURA; escrita exige ESCRITA
app.use(['/estudantes', '/professores', '/turmas'], regrasPorMetodo);
app.use('/estudantes', estudanteResource);
app.use('/professores', professorResource);
app.use('/turmas', turmaResource);

app.use(naoEncontrado); // nenhuma rota respondeu
app.use(tratadorDeErros); // por último: monta a resposta de todos os erros

export default app;
