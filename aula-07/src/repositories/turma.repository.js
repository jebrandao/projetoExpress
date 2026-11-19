import { Turma } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

export const turmaRepository = criarRepositorio(Turma);
