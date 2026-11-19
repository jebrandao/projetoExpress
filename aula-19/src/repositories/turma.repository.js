import { col, fn } from 'sequelize';
import { Estudante, Professor, Turma } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

const incluirProfessor = { model: Professor, as: 'professor' };

// O professor é carregado junto com a turma (um único SELECT com JOIN)
export const turmaRepository = {
  ...criarRepositorio(Turma, { include: [incluirProfessor] }),

  // Usa o scope "doTurno" definido no model
  buscarPorTurno: (turno) =>
    Turma.scope({ method: ['doTurno', turno] }).findAll({ include: [incluirProfessor] }),

  // Relatório com agrupamento: turmas, nome do professor e total de estudantes.
  // COUNT + GROUP BY, com LEFT JOIN para que turmas vazias também apareçam (total 0).
  resumoDasTurmas() {
    return Turma.findAll({
      attributes: ['numero', 'titulo', [fn('COUNT', col('estudantes.id')), 'totalEstudantes']],
      include: [
        { model: Professor, as: 'professor', attributes: ['nome'] },
        { model: Estudante, as: 'estudantes', attributes: [], through: { attributes: [] } },
      ],
      group: ['Turma.id', 'professor.matricula'],
      order: [['numero', 'ASC']],
      raw: true, // devolve objetos simples, não instâncias do model
      nest: true, // organiza "professor.nome" como objeto aninhado
    });
  },
};
