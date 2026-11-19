import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // Nunca guarde a senha em texto puro: aqui fica o hash gerado pelo bcrypt
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    perfil: {
      type: DataTypes.ENUM('ADMIN', 'USER'),
      allowNull: false,
      validate: { isIn: [['ADMIN', 'USER']] },
    },
  },
  {
    tableName: 'usuario',
    timestamps: false,
  },
);
