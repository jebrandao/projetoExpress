import { Usuario } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

// Além das operações básicas, o repositório de usuários tem uma consulta própria
export const usuarioRepository = {
  ...criarRepositorio(Usuario),

  buscarPorUsername: (username) => Usuario.findOne({ where: { username } }),
};
