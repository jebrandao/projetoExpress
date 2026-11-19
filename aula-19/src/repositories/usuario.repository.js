import { Papel, Permissao, Usuario } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

// Os papéis e suas permissões são carregados junto com o usuário (necessários a cada login)
const incluirPapeis = {
  model: Papel,
  as: 'papeis',
  include: [{ model: Permissao, as: 'permissoes' }],
};

export const usuarioRepository = {
  ...criarRepositorio(Usuario, { include: [incluirPapeis] }),

  buscarPorUsername: (username) => Usuario.findOne({ where: { username }, include: [incluirPapeis] }),
};
