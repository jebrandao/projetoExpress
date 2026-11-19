import { Professor } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

export const professorRepository = criarRepositorio(Professor);
