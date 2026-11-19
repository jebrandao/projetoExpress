import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Um papel agrupa permissões: ADMIN e USER
export const Papel = sequelize.define(
  'Papel',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  },
  { tableName: 'papel', timestamps: false },
);
