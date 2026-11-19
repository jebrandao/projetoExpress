import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../src/config/database.js';
import { umzug } from '../../src/config/migrator.js';
import { prepararBanco } from '../auxiliar.js';

// Teste de migração com dados reais:
// 1) desfaz a 005 (volta ao modelo antigo, com a coluna "perfil");
// 2) insere usuários nesse formato antigo; 3) aplica a 005 de novo
// e confere se cada usuário recebeu o papel que estava na coluna "perfil".
describe('migração 005 (dados dos usuários)', () => {
  before(() => prepararBanco()); // sem dados de exemplo

  it('usuários antigos recebem o papel que estava na coluna perfil', async () => {
    const silencio = mock.method(console, 'info', () => {});

    await umzug.down(); // desfaz somente a 005
    await sequelize.query("INSERT INTO usuario (username, password, perfil) VALUES ('antigo_admin', 'x', 'ADMIN')");
    await sequelize.query("INSERT INTO usuario (username, password, perfil) VALUES ('antigo_user', 'y', 'USER')");

    await umzug.up(); // aplica a 005, que migra os dados
    silencio.mock.restore();

    const ligacoes = await sequelize.query(
      `SELECT u.username, p.nome AS papel
       FROM usuario u
       JOIN usuario_papel up ON up.usuarioId = u.id
       JOIN papel p ON p.id = up.papelId
       ORDER BY u.username`,
      { type: QueryTypes.SELECT },
    );
    assert.deepEqual(ligacoes, [
      { username: 'antigo_admin', papel: 'ADMIN' },
      { username: 'antigo_user', papel: 'USER' },
    ]);

    const colunas = await sequelize.getQueryInterface().describeTable('usuario');
    assert.equal('perfil' in colunas, false); // a coluna antiga foi removida
  });
});
