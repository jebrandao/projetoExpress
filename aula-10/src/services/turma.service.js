import { turmaRepository } from '../repositories/turma.repository.js';
import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';

export const turmaService = {
  salvar(dados) {
    return turmaRepository.salvar(dados);
  },

  buscarTodos() {
    return turmaRepository.buscarTodos();
  },

  async buscarPorId(id) {
    const turma = await turmaRepository.buscarPorId(id);
    if (!turma) {
      throw new ObjectNotFoundError(`Turma não encontrada: id ${id}`);
    }
    return turma;
  },

  async atualizar(id, dados) {
    const turma = await this.buscarPorId(id);
    return turmaRepository.atualizar(turma, dados);
  },

  async excluir(id) {
    const turma = await this.buscarPorId(id);
    await turmaRepository.remover(turma);
  },

  buscarPaginado(opcoes) {
    return turmaRepository.buscarPaginado(opcoes);
  },
};
