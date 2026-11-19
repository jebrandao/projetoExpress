import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import { sequelize } from '../../src/config/database.js';
import { umzug } from '../../src/config/migrator.js';
import { prepararBanco } from '../auxiliar.js';

// Este teste roda em um banco SEM dados de propósito: no SQLite, remover uma coluna recria
// a tabela inteira, e isso falha se outras tabelas já referenciam linhas dela.
// (No MySQL, "ALTER TABLE ... DROP COLUMN" é nativo e não tem essa limitação.)
describe('migrações: desfazer e refazer', () => {
  before(() => prepararBanco()); // sem dados de exemplo

  it('desfazer todas as migrações remove as tabelas, e refazer as recria', async () => {
    const silencio = mock.method(console, 'info', () => {});

    await umzug.down({ to: 0 }); // desfaz todas, da última para a primeira
    const tabelas = await sequelize.getQueryInterface().showAllTables();
    assert.equal(tabelas.includes('estudante'), false);

    await umzug.up(); // aplica de novo
    const depois = await sequelize.getQueryInterface().showAllTables();
    assert.ok(depois.includes('estudante'));
    assert.equal((await umzug.pending()).length, 0);

    silencio.mock.restore();
  });

  it('desfazer só a última migração mantém a estrutura anterior', async () => {
    const silencio = mock.method(console, 'info', () => {});

    await umzug.down(); // desfaz apenas a 005
    const tabelas = await sequelize.getQueryInterface().showAllTables();
    assert.equal(tabelas.includes('papel'), false); // as tabelas da 005 sumiram
    const colunas = await sequelize.getQueryInterface().describeTable('usuario');
    assert.ok('perfil' in colunas); // a coluna antiga voltou
    const estudante = await sequelize.getQueryInterface().describeTable('estudante');
    assert.ok('versao' in estudante); // a 004 continua aplicada

    await umzug.up();
    silencio.mock.restore();
  });
});
