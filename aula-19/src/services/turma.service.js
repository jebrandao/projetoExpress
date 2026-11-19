import { sequelize } from '../models/index.js';
import { turmaRepository } from '../repositories/turma.repository.js';
import { professorService } from './professor.service.js';
import { estudanteService } from './estudante.service.js';
import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';

export const turmaService = {
  async salvar(dados) {
    await this.conferirProfessor(dados.professorMatricula);
    const nova = await turmaRepository.salvar(dados);
    return this.buscarPorId(nova.id); // recarrega, já com o professor
  },

  // Com "turno", usa o scope do model; sem ele, devolve todas as turmas
  buscarTodos(turno) {
    return turno ? turmaRepository.buscarPorTurno(turno) : turmaRepository.buscarTodos();
  },

  async buscarPorId(id, opcoes) {
    const turma = await turmaRepository.buscarPorId(id, opcoes);
    if (!turma) {
      throw new ObjectNotFoundError(`Turma não encontrada: id ${id}`);
    }
    return turma;
  },

  async atualizar(id, dados) {
    const turma = await this.buscarPorId(id);
    await this.conferirProfessor(dados.professorMatricula);
    await turmaRepository.atualizar(turma, dados);
    return this.buscarPorId(id);
  },

  async excluir(id) {
    const turma = await this.buscarPorId(id);
    await turmaRepository.remover(turma);
  },

  buscarPaginado(opcoes) {
    return turmaRepository.buscarPaginado(opcoes);
  },

  // Relatório: turmas com o nome do professor e o total de estudantes
  async resumoDasTurmas() {
    const linhas = await turmaRepository.resumoDasTurmas();
    return linhas.map((linha) => ({
      numero: linha.numero,
      titulo: linha.titulo,
      professor: linha.professor?.nome ?? null,
      totalEstudantes: Number(linha.totalEstudantes),
    }));
  },

  // O DTO traz só a matrícula do professor: conferimos se ele existe (ou lançamos 404)
  async conferirProfessor(matricula) {
    if (matricula != null) {
      await professorService.buscarPorId(matricula);
    }
  },

  // ---------- Relação N:N entre Turma e Estudante

  // Matricula um estudante em uma turma
  async matricularEstudante(turmaId, estudanteId) {
    const turma = await this.buscarPorId(turmaId);
    const estudante = await estudanteService.buscarPorId(estudanteId);
    await turma.addEstudante(estudante); // grava uma linha em turma_estudante
  },

  // Remove a matrícula de um estudante
  async desmatricularEstudante(turmaId, estudanteId) {
    const turma = await this.buscarPorId(turmaId);
    const estudante = await estudanteService.buscarPorId(estudanteId);
    await turma.removeEstudante(estudante);
  },

  // Lista os estudantes matriculados na turma
  async buscarEstudantesDaTurma(turmaId) {
    const turma = await this.buscarPorId(turmaId);
    return turma.getEstudantes({ include: [{ association: 'endereco' }] });
  },

  // TRANSAÇÃO: duas operações que precisam ser atômicas, ou acontecem as duas, ou nenhuma.
  // Tudo o que usa { transaction } participa da mesma transação. Se algo lançar um erro
  // (ex.: a turma de destino não existe), o Sequelize desfaz (rollback) também a remoção da origem.
  async transferirEstudante(origemId, destinoId, estudanteId) {
    await sequelize.transaction(async (transaction) => {
      const origem = await this.buscarPorId(origemId, { transaction });
      const estudante = await estudanteService.buscarPorId(estudanteId);

      await origem.removeEstudante(estudante, { transaction }); // o DELETE já foi para o banco...

      const destino = await this.buscarPorId(destinoId, { transaction }); // ...mas, se isto falhar, tudo é desfeito
      await destino.addEstudante(estudante, { transaction });
    });
  },
};
