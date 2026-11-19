import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { prepararBanco, admin, aluno } from '../auxiliar.js';

describe('consultas avançadas (integração)', () => {
  before(() => prepararBanco({ comDados: true }));

  const buscar = (consulta) => request(app).get(`/estudantes/busca${consulta}`).auth(...aluno);
  const nomes = (resposta) => resposta.body.content.map((e) => e.nome);

  it('filtra por parte do nome', async () => {
    const resposta = await buscar('?nome=cre');
    assert.equal(resposta.status, 200);
    assert.deepEqual(nomes(resposta), ['Cremilda']);
  });

  it('filtra por data de nascimento', async () => {
    const resposta = await buscar('?nascidoApos=2000-01-01');
    assert.deepEqual(nomes(resposta), ['Bernardo']); // o único nascido depois de 2000
  });

  it('filtra pelos estudantes de uma turma (JOIN com a tabela de ligação)', async () => {
    const resposta = await buscar('?turmaId=1');
    assert.deepEqual(nomes(resposta), ['Alberto', 'Cremilda']);
  });

  it('combina filtros: só se aplicam os informados', async () => {
    const resposta = await buscar('?turmaId=1&nome=alb');
    assert.deepEqual(nomes(resposta), ['Alberto']);
  });

  it('sem filtros devolve todos, paginados e ordenados por nome', async () => {
    const resposta = await buscar('?itensPorPagina=2');
    assert.deepEqual(nomes(resposta), ['Alberto', 'Bernardo']);
    assert.equal(resposta.body.page.totalElements, 3);
    assert.equal(resposta.body.page.totalPages, 2);
  });

  it('o relatório conta os estudantes de cada turma (inclusive turmas vazias)', async () => {
    await request(app).post('/turmas').auth(...admin)
      .send({ numero: '20250009', titulo: 'Turma vazia', turno: 'TARDE' });

    const resposta = await request(app).get('/turmas/resumo').auth(...aluno);

    assert.equal(resposta.status, 200);
    const porNumero = Object.fromEntries(resposta.body.map((t) => [t.numero, t]));
    assert.equal(porNumero['20240007'].totalEstudantes, 2);
    assert.equal(porNumero['20240007'].professor, 'Marta Oliveira Santos');
    assert.equal(porNumero['20240008'].totalEstudantes, 1);
    assert.equal(porNumero['20250009'].totalEstudantes, 0);
    assert.equal(porNumero['20250009'].professor, null);
  });

  it('o scope filtra as turmas por turno', async () => {
    const resposta = await request(app).get('/turmas?turno=NOITE').auth(...aluno);
    assert.equal(resposta.status, 200);
    assert.ok(resposta.body.length >= 1);
    assert.ok(resposta.body.every((t) => t.turno === 'NOITE'));
  });

  it('turno inválido retorna 400', async () => {
    const resposta = await request(app).get('/turmas?turno=MADRUGADA').auth(...aluno);
    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.errors[0].fieldName, 'turno');
  });
});
