import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { sequelize } from '../../src/config/database.js';
import { umzug } from '../../src/config/migrator.js';
import { prepararBanco, admin } from '../auxiliar.js';

describe('migrações (integração)', () => {
  before(() => prepararBanco({ comDados: true }));

  const nomesAplicados = async () => (await umzug.executed()).map((m) => m.name);

  it('todas as migrações foram aplicadas, na ordem', async () => {
    assert.deepEqual(await nomesAplicados(), [
      '001-criar-tabelas.js',
      '002-adicionar-telefone-ao-estudante.js',
      '003-email-unico-para-estudante.js',
    ]);
    assert.equal((await umzug.pending()).length, 0);
  });

  it('a coluna criada pela migração 002 existe na tabela', async () => {
    const colunas = await sequelize.getQueryInterface().describeTable('estudante');
    assert.ok('telefone' in colunas);
  });

  it('o telefone é gravado e devolvido pela API', async () => {
    const corpo = { nome: 'Com Telefone', email: 'telefone@email.com', telefone: '(21) 90000-0000' };
    const resposta = await request(app).post('/estudantes').auth(...admin).send(corpo);

    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.telefone, '(21) 90000-0000');
  });

  it('e-mail duplicado viola a restrição da migração 003 (409)', async () => {
    const corpo = { nome: 'Duplicado', email: 'duplicado@email.com' };

    const primeira = await request(app).post('/estudantes').auth(...admin).send(corpo);
    const segunda = await request(app).post('/estudantes').auth(...admin).send(corpo);

    assert.equal(primeira.status, 201);
    assert.equal(segunda.status, 409);
  });

  it('desfazer e refazer as migrações recria o banco (up e down)', async () => {
    const silencio = (await import('node:test')).mock.method(console, 'info', () => {});

    await umzug.down({ to: 0 }); // desfaz todas
    const tabelas = await sequelize.getQueryInterface().showAllTables();
    assert.equal(tabelas.includes('estudante'), false);

    await umzug.up(); // aplica de novo
    const depois = await sequelize.getQueryInterface().showAllTables();
    assert.ok(depois.includes('estudante'));
    assert.equal((await umzug.pending()).length, 0);

    silencio.mock.restore();
  });
});
