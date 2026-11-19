import { Estudante } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

export const estudanteRepository = criarRepositorio(Estudante);
