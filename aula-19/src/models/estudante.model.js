import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { aplicarAuditoria, camposDeAuditoria, opcoesDeAuditoria } from './auditoria.js';

// Um model representa uma tabela. Cada propriedade vira uma coluna.
export const Estudante = sequelize.define(
  'Estudante',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false, // coluna obrigatória
    },
    sobreNome: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true, // criado pela migração 003
    },
    dataNascimento: DataTypes.DATEONLY, // somente a data, sem hora
    telefone: DataTypes.STRING(20), // coluna criada pela migração 002
    ...camposDeAuditoria,
  },
  {
    tableName: 'estudante',
    ...opcoesDeAuditoria,

    // Bloqueio otimista: a cada UPDATE o Sequelize soma 1 em "versao" e só altera
    // se a versão do banco ainda for a que foi lida (senão lança OptimisticLockError)
    version: 'versao',

    // Exclusão lógica: destroy() apenas preenche "excluidoEm" e as consultas ignoram esses registros
    paranoid: true,
    deletedAt: 'excluidoEm',
  },
);

aplicarAuditoria(Estudante);
