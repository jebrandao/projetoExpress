import { sequelize } from '../config/database.js';
import { Estudante } from './estudante.model.js';
import { Professor } from './professor.model.js';
import { Turma } from './turma.model.js';

// Ponto único de importação dos models
export { sequelize, Estudante, Professor, Turma };
