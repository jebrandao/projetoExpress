import { mock } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { migrar } from '../src/config/migrator.js';
import '../src/models/index.js'; // registra os models antes de migrar
import { iniciarDados } from '../src/inicializacao/init.js';

// Prepara o banco em memória para um arquivo de testes:
// aplica as migrações (o banco em memória começa vazio) e, se pedido,
// carrega os dados de exemplo (os mesmos da aplicação).
export async function prepararBanco({ comDados = false } = {}) {
  const silencioMigracoes = mock.method(console, 'info', () => {}); // o Umzug registra cada migração
  try {
    await migrar();
  } finally {
    silencioMigracoes.mock.restore();
  }

  if (comDados) {
    const silencio = mock.method(console, 'log', () => {}); // a carga imprime no console
    try {
      await iniciarDados();
    } finally {
      silencio.mock.restore();
    }
  }
}

// Credenciais dos usuários criados pela carga de dados
export const admin = ['admin', 'admin123'];
export const aluno = ['aluno', 'aluno123'];

// Faz o login de verdade em /auth/login e devolve o valor do cabeçalho Authorization
// ("Bearer <token>") de cada usuário de teste.
export async function logar() {
  const cabecalho = async ([username, senha]) => {
    const resposta = await request(app).post('/auth/login').send({ username, senha });
    return `Bearer ${resposta.body.token}`;
  };
  return { admin: await cabecalho(admin), aluno: await cabecalho(aluno) };
}
