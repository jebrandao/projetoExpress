import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

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
  },
  {
    tableName: 'estudante',
    timestamps: false, // sem as colunas automáticas createdAt/updatedAt
  },
);
