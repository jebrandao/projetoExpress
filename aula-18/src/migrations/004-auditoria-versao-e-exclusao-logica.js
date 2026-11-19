import { DataTypes } from 'sequelize';

// V4: controle de versão (bloqueio otimista), exclusão lógica e auditoria

const camposDeAuditoria = {
  criadoEm: { type: DataTypes.DATE },
  atualizadoEm: { type: DataTypes.DATE },
  criadoPor: { type: DataTypes.STRING },
  atualizadoPor: { type: DataTypes.STRING },
};

const tabelasAuditadas = ['estudante', 'professor', 'turma'];

export async function up({ context: queryInterface }) {
  // Estudante: versão e exclusão lógica
  await queryInterface.addColumn('estudante', 'versao', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });
  await queryInterface.addColumn('estudante', 'excluidoEm', { type: DataTypes.DATE });

  // Auditoria: quem e quando criou/alterou cada registro
  for (const tabela of tabelasAuditadas) {
    for (const [coluna, definicao] of Object.entries(camposDeAuditoria)) {
      await queryInterface.addColumn(tabela, coluna, definicao);
    }
  }
}

export async function down({ context: queryInterface }) {
  for (const tabela of tabelasAuditadas) {
    for (const coluna of Object.keys(camposDeAuditoria)) {
      await queryInterface.removeColumn(tabela, coluna);
    }
  }
  await queryInterface.removeColumn('estudante', 'excluidoEm');
  await queryInterface.removeColumn('estudante', 'versao');
}
