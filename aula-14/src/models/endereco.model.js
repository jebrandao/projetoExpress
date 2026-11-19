import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Endereco = sequelize.define(
  'Endereco',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    logradouro: DataTypes.STRING,
    numero: DataTypes.STRING,
    cep: DataTypes.STRING,
    cidade: DataTypes.STRING,
  },
  {
    tableName: 'endereco',
    timestamps: false,
  },
);
