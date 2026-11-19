import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { sequelize, Estudante } from '../../src/models/index.js';
import { prepararBanco, logar } from '../auxiliar.js';

describe('persistência avançada (integração)', () => {
  let t; // tokens JWT dos usuários de teste
  before(async () => {
    await prepararBanco({ comDados: true });
    t = await logar();
  });

  const criarEstudante = async (email) => {
    const resposta = await request(app).post('/estudantes').set('Authorization', t.admin)
      .send({ nome: 'Persistência', email });
    assert.equal(resposta.status, 201);
    return resposta.body;
  };

  // ---------- auditoria

  it('a auditoria registra o usuário do login que criou o registro', async () => {
    const criado = await criarEstudante('auditoria@email.com');

    const resposta = await request(app).get(`/estudantes/${criado.id}`).set('Authorization', t.aluno);

    assert.equal(resposta.body.criadoPor, 'admin');
    assert.equal(resposta.body.atualizadoPor, 'admin');
    assert.ok(resposta.body.criadoEm);
  });

  it('os dados carregados pela Init ficam como usuário "sistema"', async () => {
    const resposta = await request(app).get('/estudantes/1').set('Authorization', t.aluno);
    assert.equal(resposta.body.criadoPor, 'sistema');
  });

  // ---------- exclusão lógica

  it('a exclusão lógica mantém a linha no banco, mas a esconde da API', async () => {
    const criado = await criarEstudante('exclusao@email.com');

    const exclusao = await request(app).delete(`/estudantes/${criado.id}`).set('Authorization', t.admin);
    assert.equal(exclusao.status, 204);

    assert.equal((await request(app).get(`/estudantes/${criado.id}`).set('Authorization', t.aluno)).status, 404);
    const lista = await request(app).get('/estudantes').set('Authorization', t.aluno);
    assert.equal(lista.body.some((e) => e.id === criado.id), false);

    // A linha continua na tabela, marcada com a data da exclusão
    const [linhas] = await sequelize.query('SELECT excluidoEm FROM estudante WHERE id = ?', { replacements: [criado.id] });
    assert.equal(linhas.length, 1);
    assert.ok(linhas[0].excluidoEm);
  });

  it('o e-mail de um estudante excluído continua reservado (contrapartida da exclusão lógica)', async () => {
    const criado = await criarEstudante('reservado@email.com');
    await request(app).delete(`/estudantes/${criado.id}`).set('Authorization', t.admin);

    const repetido = await request(app).post('/estudantes').set('Authorization', t.admin)
      .send({ nome: 'Outro', email: 'reservado@email.com' });

    assert.equal(repetido.status, 409);
  });

  // ---------- bloqueio otimista

  it('a API rejeita a edição feita com uma versão desatualizada (409)', async () => {
    const criado = await criarEstudante('versao@email.com');
    assert.equal(criado.versao, 0);
    const corpo = (versao) => ({ nome: 'Alterado', email: 'versao@email.com', versao });

    const primeira = await request(app).put(`/estudantes/${criado.id}`).set('Authorization', t.admin).send(corpo(0));
    assert.equal(primeira.status, 200);
    assert.equal(primeira.body.versao, 1);

    const segunda = await request(app).put(`/estudantes/${criado.id}`).set('Authorization', t.admin).send(corpo(0));
    assert.equal(segunda.status, 409);
    assert.equal(segunda.body.error, 'Optimistic lock');
  });

  it('o Sequelize detecta duas edições simultâneas do mesmo registro', async () => {
    const criado = await criarEstudante('concorrente@email.com');
    const copiaA = await Estudante.findByPk(criado.id);
    const copiaB = await Estudante.findByPk(criado.id); // duas pessoas abriram o mesmo cadastro

    await copiaA.update({ nome: 'Primeira pessoa' });

    await assert.rejects(
      () => copiaB.update({ nome: 'Segunda pessoa' }),
      (erro) => erro.name === 'SequelizeOptimisticLockError',
    );
  });

  // ---------- transação

  const listar = async (turmaId) =>
    (await request(app).get(`/turmas/${turmaId}/estudantes`).set('Authorization', t.aluno)).body.map((e) => e.id);

  it('a transferência move o estudante de uma turma para outra', async () => {
    const estudante = await criarEstudante('transfere@email.com');
    await request(app).post(`/turmas/1/estudantes/${estudante.id}`).set('Authorization', t.admin);

    const resposta = await request(app)
      .post(`/turmas/1/estudantes/${estudante.id}/transferir/2`).set('Authorization', t.admin);

    assert.equal(resposta.status, 204);
    assert.equal((await listar(1)).includes(estudante.id), false);
    assert.equal((await listar(2)).includes(estudante.id), true);
  });

  it('se o destino não existe, o rollback desfaz também a remoção da origem', async () => {
    const estudante = await criarEstudante('rollback@email.com');
    await request(app).post(`/turmas/1/estudantes/${estudante.id}`).set('Authorization', t.admin);

    const resposta = await request(app)
      .post(`/turmas/1/estudantes/${estudante.id}/transferir/99999`).set('Authorization', t.admin);

    assert.equal(resposta.status, 404);
    // O estudante continua matriculado na turma de origem: nada foi alterado
    assert.equal((await listar(1)).includes(estudante.id), true);
  });
});
