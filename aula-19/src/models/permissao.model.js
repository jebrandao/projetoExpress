import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Uma ação que pode ser autorizada: LEITURA, ESCRITA, USUARIOS
export const Permissao = sequelize.define(
  'Permissao',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  },
  { tableName: 'permissao', timestamps: false },
);
