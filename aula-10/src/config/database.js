import { Sequelize } from 'sequelize';
import { config } from './env.js';

// A conexão com o banco. O Sequelize é o ORM: mapeia objetos JavaScript para tabelas.
export const sequelize = new Sequelize({
  dialect: config.bd.dialeto,
  storage: config.bd.arquivo, // usado pelo SQLite
  logging: config.bd.log ? (sql) => console.log(sql) : false,
});
