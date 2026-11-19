import bcrypt from 'bcryptjs';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { papelRepository } from '../repositories/papel.repository.js';
import { RegraNegocioError } from '../exceptions/regra-negocio.error.js';

// Quantas vezes o bcrypt repete o cálculo: quanto maior, mais lento (e mais seguro) é o hash
const CUSTO_DO_HASH = 10;

export const usuarioService = {
  // Cria o usuário guardando apenas o HASH da senha
  async criarUsuario(username, senhaPura, nomesDosPapeis) {
    if (await this.existe(username)) {
      throw new RegraNegocioError(`Já existe um usuário com o login ${username}`);
    }

    const papeis = [];
    for (const nome of nomesDosPapeis) {
      const papel = await papelRepository.buscarPorNome(nome);
      if (!papel) {
        throw new RegraNegocioError(`Papel inexistente: ${nome}`);
      }
      papeis.push(papel);
    }

    const hash = await bcrypt.hash(senhaPura, CUSTO_DO_HASH);
    const usuario = await usuarioRepository.salvar({ username, password: hash });
    await usuario.setPapeis(papeis); // grava as linhas de usuario_papel

    return usuarioRepository.buscarPorId(usuario.id); // recarrega, já com os papéis
  },

  buscarTodos() {
    return usuarioRepository.buscarTodos();
  },

  async existe(username) {
    return (await usuarioRepository.buscarPorUsername(username)) !== null;
  },

  // Devolve o usuário se o login e a senha conferem; senão, devolve null.
  async autenticar(username, senhaPura) {
    const usuario = await usuarioRepository.buscarPorUsername(username);
    if (!usuario) {
      return null;
    }
    const confere = await bcrypt.compare(senhaPura, usuario.password);
    return confere ? usuario : null;
  },

  // Cada papel vira a autoridade ROLE_xxx e cada permissão vira uma autoridade com o próprio nome
  autoridadesDe(usuario) {
    const autoridades = new Set();
    for (const papel of usuario.papeis) {
      autoridades.add(`ROLE_${papel.nome}`);
      for (const permissao of papel.permissoes) {
        autoridades.add(permissao.nome);
      }
    }
    return [...autoridades];
  },
};
