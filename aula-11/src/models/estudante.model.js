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
    email: DataTypes.STRING,
    dataNascimento: DataTypes.DATEONLY, // somente a data, sem hora
  },
  {
    tableName: 'estudante',
    timestamps: false, // sem as colunas automáticas createdAt/updatedAt
  },
);
