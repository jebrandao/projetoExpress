import { DataTypes } from 'sequelize';

// V2: novo campo opcional na tabela de estudantes
export async function up({ context: queryInterface }) {
  await queryInterface.addColumn('estudante', 'telefone', {
    type: DataTypes.STRING(20),
    allowNull: true,
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn('estudante', 'telefone');
}
