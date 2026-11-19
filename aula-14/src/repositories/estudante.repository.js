import { Endereco, Estudante } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

// O endereço é carregado e gravado junto com o estudante
export const estudanteRepository = criarRepositorio(Estudante, {
  include: [{ model: Endereco, as: 'endereco' }],
});
