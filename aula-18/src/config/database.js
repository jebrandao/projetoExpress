import { Sequelize } from 'sequelize';
import { config } from './env.js';

const { bd } = config;
const logging = bd.log ? (sql) => console.log(sql) : false;

// A conexão com o banco. O Sequelize é o ORM: mapeia objetos JavaScript para tabelas.
// O mesmo código funciona com SQLite (desenvolvimento) e MySQL (produção).
export const sequelize =
  bd.dialeto === 'mysql'
    ? new Sequelize(bd.nome, bd.usuario, bd.senha, {
        host: bd.host,
        port: bd.porta,
        dialect: 'mysql',
        logging,
      })
    : new Sequelize({ dialect: 'sqlite', storage: bd.arquivo, logging });
