import { DataTypes } from 'sequelize';

// V1: estrutura inicial do banco.
// "up" aplica a migração; "down" desfaz (na ordem inversa, por causa das chaves estrangeiras).
export async function up({ context: queryInterface }) {
  await queryInterface.createTable('endereco', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    logradouro: DataTypes.STRING,
    numero: DataTypes.STRING,
    cep: DataTypes.STRING,
    cidade: DataTypes.STRING,
  });

  await queryInterface.createTable('estudante', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    sobreNome: DataTypes.STRING,
    email: DataTypes.STRING,
    dataNascimento: DataTypes.DATEONLY,
    enderecoId: {
      type: DataTypes.INTEGER,
      references: { model: 'endereco', key: 'id' },
      onDelete: 'SET NULL',
    },
  });

  await queryInterface.createTable('professor', {
    matricula: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    especializacao: DataTypes.STRING,
    telefone: DataTypes.STRING,
  });

  await queryInterface.createTable('turma', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.STRING(8), allowNull: false, unique: true },
    titulo: DataTypes.STRING,
    turno: DataTypes.ENUM('MANHA', 'TARDE', 'NOITE'),
    professorMatricula: {
      type: DataTypes.INTEGER,
      references: { model: 'professor', key: 'matricula' },
      onDelete: 'RESTRICT',
    },
  });

  // Tabela de ligação da relação N:N entre turma e estudante
  await queryInterface.createTable('turma_estudante', {
    turmaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'turma', key: 'id' },
      onDelete: 'CASCADE',
    },
    estudanteId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'estudante', key: 'id' },
      onDelete: 'CASCADE',
    },
  });

  await queryInterface.createTable('usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    perfil: { type: DataTypes.ENUM('ADMIN', 'USER'), allowNull: false },
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('usuario');
  await queryInterface.dropTable('turma_estudante');
  await queryInterface.dropTable('turma');
  await queryInterface.dropTable('professor');
  await queryInterface.dropTable('estudante');
  await queryInterface.dropTable('endereco');
}
