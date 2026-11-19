import { professorRepository } from '../repositories/professor.repository.js';
import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';

export const professorService = {
  salvar(dados) {
    return professorRepository.salvar(dados);
  },

  buscarTodos() {
    return professorRepository.buscarTodos();
  },

  // O "id" do professor é a matrícula
  async buscarPorId(matricula) {
    const professor = await professorRepository.buscarPorId(matricula);
    if (!professor) {
      throw new ObjectNotFoundError(`Professor não encontrado: matrícula ${matricula}`);
    }
    return professor;
  },

  async atualizar(matricula, dados) {
    const professor = await this.buscarPorId(matricula);
    return professorRepository.atualizar(professor, dados);
  },

  async excluir(matricula) {
    const professor = await this.buscarPorId(matricula);
    await professorRepository.remover(professor);
  },

  buscarPaginado(opcoes) {
    return professorRepository.buscarPaginado(opcoes);
  },
};
