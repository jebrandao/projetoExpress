import bcrypt from 'bcryptjs';
import { usuarioRepository } from '../repositories/usuario.repository.js';

// Quantas vezes o bcrypt repete o cálculo: quanto maior, mais lento (e mais seguro) é o hash
const CUSTO_DO_HASH = 10;

export const usuarioService = {
  // Cria o usuário guardando apenas o HASH da senha
  async criarUsuario(username, senhaPura, perfil) {
    const hash = await bcrypt.hash(senhaPura, CUSTO_DO_HASH);
    return usuarioRepository.salvar({ username, password: hash, perfil });
  },

  async existe(username) {
    return (await usuarioRepository.buscarPorUsername(username)) !== null;
  },

  // Devolve o usuário se o login e a senha conferem; senão, devolve null.
  // O bcrypt.compare aplica o mesmo hash à senha digitada e compara com o guardado.
  async autenticar(username, senhaPura) {
    const usuario = await usuarioRepository.buscarPorUsername(username);
    if (!usuario) {
      return null;
    }
    const confere = await bcrypt.compare(senhaPura, usuario.password);
    return confere ? usuario : null;
  },
};
