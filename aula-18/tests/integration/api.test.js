import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { prepararBanco, admin, aluno } from '../auxiliar.js';

// Teste de integração: percorre o caminho completo
// requisição > segurança > validação > resource > service > repository > banco.
describe('API (integração)', () => {
  before(() => prepararBanco({ comDados: true }));

  const novoEstudante = {
    nome: 'Teste Integração',
    email: 'integracao@email.com',
    dataNascimento: '2001-03-15',
    endereco: { logradouro: 'Rua A', numero: '1', cep: '20000-000', cidade: 'Rio' },
  };

  it('sem login retorna 401', async () => {
    const resposta = await request(app).get('/estudantes');
    assert.equal(resposta.status, 401);
  });

  it('senha errada retorna 401 com mensagem genérica', async () => {
    const resposta = await request(app).get('/estudantes').auth('admin', 'errada');
    assert.equal(resposta.status, 401);
    assert.equal(resposta.body.message, 'Usuário ou senha inválidos');
  });

  it('as rotas públicas dispensam login', async () => {
    assert.equal((await request(app).get('/')).status, 200);
    assert.equal((await request(app).get('/api-docs/')).status, 200);
  });

  it('o aluno consulta os dados carregados pela Init', async () => {
    const resposta = await request(app).get('/estudantes').auth(...aluno);
    assert.equal(resposta.status, 200);
    assert.ok(resposta.body.some((e) => e.nome === 'Alberto'));
  });

  it('o aluno não pode excluir (403)', async () => {
    const resposta = await request(app).delete('/estudantes/1').auth(...aluno);
    assert.equal(resposta.status, 403);
  });

  it('o admin cadastra, consulta e exclui um estudante', async () => {
    const criado = await request(app).post('/estudantes').auth(...admin).send(novoEstudante);
    assert.equal(criado.status, 201);
    const id = criado.body.id;

    const consulta = await request(app).get(`/estudantes/${id}`).auth(...aluno);
    assert.equal(consulta.status, 200);
    assert.equal(consulta.body.endereco.cidade, 'Rio');

    const exclusao = await request(app).delete(`/estudantes/${id}`).auth(...admin);
    assert.equal(exclusao.status, 204);

    const depois = await request(app).get(`/estudantes/${id}`).auth(...aluno);
    assert.equal(depois.status, 404);
  });

  it('dados inválidos retornam 400 com a lista de erros', async () => {
    const resposta = await request(app).post('/estudantes').auth(...admin).send({ nome: '', email: 'x' });
    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.errors.length, 2);
  });

  it('id inexistente retorna 404 com o corpo padronizado', async () => {
    const resposta = await request(app).get('/estudantes/9999').auth(...aluno);
    assert.equal(resposta.status, 404);
    assert.equal(resposta.body.error, 'Object not found');
    assert.equal(resposta.body.path, '/estudantes/9999');
  });

  it('o admin matricula um estudante na turma', async () => {
    const matricula = await request(app).post('/turmas/2/estudantes/3').auth(...admin);
    assert.equal(matricula.status, 204);

    const lista = await request(app).get('/turmas/2/estudantes').auth(...aluno);
    assert.equal(lista.status, 200);
    assert.ok(lista.body.some((e) => e.id === 3));
  });

  it('matricular em turma inexistente retorna 404', async () => {
    const resposta = await request(app).post('/turmas/999/estudantes/1').auth(...admin);
    assert.equal(resposta.status, 404);
  });

  it('número de turma duplicado retorna 409', async () => {
    const turma = { numero: '20240007', titulo: 'Repetida', turno: 'NOITE' };
    const resposta = await request(app).post('/turmas').auth(...admin).send(turma);
    assert.equal(resposta.status, 409);
  });

  it('a paginação devolve a página pedida', async () => {
    const resposta = await request(app)
      .get('/estudantes/paginacao?pagina=0&itensPorPagina=2&ordenacao=nome')
      .auth(...aluno);
    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.content.length, 2);
    assert.ok(resposta.body.page.totalElements >= 3);
  });
});
