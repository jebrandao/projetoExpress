import { estudanteRepository } from '../repositories/estudante.repository.js';
import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';

// A camada de serviço guarda as regras de negócio.
// Ela usa o repositório para acessar os dados e é usada pela camada de resource (as rotas).
export const estudanteService = {
  salvar(dados) {
    return estudanteRepository.salvar(dados);
  },

  buscarTodos() {
    return estudanteRepository.buscarTodos();
  },

  async buscarPorId(id) {
    const estudante = await estudanteRepository.buscarPorId(id);
    if (!estudante) {
      throw new ObjectNotFoundError(`Estudante não encontrado: id ${id}`);
    }
    return estudante;
  },

  async atualizar(id, dados) {
    const estudante = await this.buscarPorId(id); // lança o erro se não existir
    return estudanteRepository.atualizar(estudante, dados);
  },

  async excluir(id) {
    const estudante = await this.buscarPorId(id);
    await estudanteRepository.remover(estudante);
  },

  buscarPaginado(opcoes) {
    return estudanteRepository.buscarPaginado(opcoes);
  },
};
