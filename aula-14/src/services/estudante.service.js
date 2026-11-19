import { estudanteRepository } from '../repositories/estudante.repository.js';
import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';

// A camada de serviço guarda as regras de negócio.
// Ela usa o repositório para acessar os dados e é usada pela camada de resource (as rotas).
export const estudanteService = {
  // O endereço (se informado) é gravado junto com o estudante
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
    const { endereco, ...camposDoEstudante } = dados;

    await estudanteRepository.atualizar(estudante, camposDoEstudante);

    if (endereco) {
      if (estudante.endereco) {
        await estudante.endereco.update(endereco); // altera o endereço existente
      } else {
        await estudante.createEndereco(endereco); // ou cria um novo
      }
    }
    return this.buscarPorId(id); // recarrega com o endereço atualizado
  },

  async excluir(id) {
    const estudante = await this.buscarPorId(id);
    await estudanteRepository.remover(estudante);
    // O endereço pertence ao estudante: sai junto com ele
    if (estudante.endereco) {
      await estudante.endereco.destroy();
    }
  },

  buscarPaginado(opcoes) {
    return estudanteRepository.buscarPaginado(opcoes);
  },
};
