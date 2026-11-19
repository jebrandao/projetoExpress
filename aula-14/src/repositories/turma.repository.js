import { Professor, Turma } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

// O professor é carregado junto com a turma (um único SELECT com JOIN)
export const turmaRepository = criarRepositorio(Turma, {
  include: [{ model: Professor, as: 'professor' }],
});
