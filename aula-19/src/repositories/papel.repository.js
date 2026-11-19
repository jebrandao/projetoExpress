import { Papel, Permissao } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

export const papelRepository = {
  ...criarRepositorio(Papel),

  // Carrega as permissões junto com o papel
  buscarPorNome: (nome) =>
    Papel.findOne({ where: { nome }, include: [{ model: Permissao, as: 'permissoes' }] }),
};
