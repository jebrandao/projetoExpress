import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Turma = sequelize.define(
  'Turma',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Formato AAAANNNN: ano + número da turma. Exemplo: 20240007
    numero: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
    },
    titulo: DataTypes.STRING,
    // ENUM: conjunto fixo de valores. O SQLite não confere sozinho,
    // então o "isIn" faz o Sequelize rejeitar valores fora da lista.
    turno: {
      type: DataTypes.ENUM('MANHA', 'TARDE', 'NOITE'),
      validate: { isIn: [['MANHA', 'TARDE', 'NOITE']] },
    },
  },
  {
    tableName: 'turma',
    timestamps: false,
  },
);
