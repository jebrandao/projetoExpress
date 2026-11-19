import { estudanteRepository } from '../repositories/estudante.repository.js';
import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';
import { ConflictError } from '../exceptions/conflict.error.js';

// A camada de serviço guarda as regras de negócio.
// Ela usa o repositório para acessar os dados e é usada pela camada de resource (as rotas).
export const estudanteService = {
  // O endereço (se informado) é gravado junto com o estudante
  salvar(dados) {
    const { versao, ...camposDoEstudante } = dados; // a versão é controlada pelo banco
    return estudanteRepository.salvar(camposDoEstudante);
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
    const { endereco, versao, ...camposDoEstudante } = dados;

    // Bloqueio otimista: o cliente editou uma versão que já foi alterada por outra pessoa
    if (versao !== undefined && versao !== estudante.versao) {
      throw new ConflictError();
    }

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

  // Exclusão lógica (paranoid): o registro continua na tabela, marcado como excluído.
  // O endereço NÃO é apagado, pois o estudante excluído ainda aponta para ele.
  async excluir(id) {
    const estudante = await this.buscarPorId(id);
    await estudanteRepository.remover(estudante);
  },

  buscarPaginado(opcoes) {
    return estudanteRepository.buscarPaginado(opcoes);
  },

  // Busca com filtros opcionais (nome, data de nascimento, turma)
  buscarComFiltros(filtros) {
    return estudanteRepository.buscarComFiltros(filtros);
  },
};
