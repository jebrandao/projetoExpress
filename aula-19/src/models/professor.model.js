import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { aplicarAuditoria, camposDeAuditoria, opcoesDeAuditoria } from './auditoria.js';

export const Professor = sequelize.define(
  'Professor',
  {
    // A matrícula é a chave primária: sequencial e numérica
    matricula: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    especializacao: DataTypes.STRING,
    telefone: DataTypes.STRING,
    ...camposDeAuditoria,
  },
  {
    tableName: 'professor',
    ...opcoesDeAuditoria,
  },
);

aplicarAuditoria(Professor);
