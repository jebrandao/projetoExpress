import { DataTypes, QueryTypes } from 'sequelize';

// V5: papéis e permissões guardados em tabelas (substituem a coluna "perfil" do usuário).
//
// Ordem importante: a coluna "perfil" é removida ANTES de criar a tabela usuario_papel.
// No SQLite, remover uma coluna recria a tabela inteira, e isso não pode acontecer
// enquanto outra tabela já referencia "usuario".
export async function up({ context: queryInterface }) {
  // ---------- permissões e papéis
  await queryInterface.createTable('permissao', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  });

  await queryInterface.createTable('papel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  });

  await queryInterface.createTable('papel_permissao', {
    papelId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'papel', key: 'id' },
      onDelete: 'CASCADE',
    },
    permissaoId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'permissao', key: 'id' },
      onDelete: 'CASCADE',
    },
  });

  // ---------- dados iniciais
  await queryInterface.bulkInsert('permissao', [{ nome: 'LEITURA' }, { nome: 'ESCRITA' }, { nome: 'USUARIOS' }]);
  await queryInterface.bulkInsert('papel', [{ nome: 'ADMIN' }, { nome: 'USER' }]);

  const buscarId = async (tabela, nome) => {
    const [linha] = await queryInterface.sequelize.query(`SELECT id FROM ${tabela} WHERE nome = ?`, {
      replacements: [nome],
      type: QueryTypes.SELECT,
    });
    return linha.id;
  };
  const admin = await buscarId('papel', 'ADMIN');
  const user = await buscarId('papel', 'USER');
  const leitura = await buscarId('permissao', 'LEITURA');
  const escrita = await buscarId('permissao', 'ESCRITA');
  const usuarios = await buscarId('permissao', 'USUARIOS');

  // ADMIN tem todas as permissões; USER só pode ler
  await queryInterface.bulkInsert('papel_permissao', [
    { papelId: admin, permissaoId: leitura },
    { papelId: admin, permissaoId: escrita },
    { papelId: admin, permissaoId: usuarios },
    { papelId: user, permissaoId: leitura },
  ]);

  // ---------- migração dos dados: cada usuário recebe o papel que estava na coluna "perfil"
  const antigos = await queryInterface.sequelize.query('SELECT id, perfil FROM usuario', {
    type: QueryTypes.SELECT,
  });
  const idDoPapel = { ADMIN: admin, USER: user };

  await queryInterface.removeColumn('usuario', 'perfil');

  await queryInterface.createTable('usuario_papel', {
    usuarioId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'usuario', key: 'id' },
      onDelete: 'CASCADE',
    },
    papelId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'papel', key: 'id' },
      onDelete: 'CASCADE',
    },
  });

  if (antigos.length > 0) {
    await queryInterface.bulkInsert(
      'usuario_papel',
      antigos.map((u) => ({ usuarioId: u.id, papelId: idDoPapel[u.perfil] })),
    );
  }
}

export async function down({ context: queryInterface }) {
  // Volta a coluna "perfil" (opcional ao voltar) e preenche a partir do primeiro papel de cada usuário
  await queryInterface.addColumn('usuario', 'perfil', { type: DataTypes.ENUM('ADMIN', 'USER') });
  await queryInterface.sequelize.query(`
    UPDATE usuario SET perfil = (
      SELECT p.nome FROM usuario_papel up
      JOIN papel p ON p.id = up.papelId
      WHERE up.usuarioId = usuario.id
      ORDER BY p.id LIMIT 1
    )`);

  await queryInterface.dropTable('usuario_papel');
  await queryInterface.dropTable('papel_permissao');
  await queryInterface.dropTable('papel');
  await queryInterface.dropTable('permissao');
}
