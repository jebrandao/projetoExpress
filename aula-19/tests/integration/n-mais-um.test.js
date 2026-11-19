import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { Professor, Turma } from '../../src/models/index.js';
import { prepararBanco } from '../auxiliar.js';

// O problema N+1: 1 consulta para listar + 1 consulta EXTRA para cada item da lista.
describe('problema N+1 (medido)', () => {
  before(async () => {
    await prepararBanco(); // banco limpo: só as 3 turmas criadas abaixo
    for (const nome of ['Prof A', 'Prof B', 'Prof C']) {
      const professor = await Professor.create({ nome });
      await Turma.create({
        numero: String(20260000 + professor.matricula),
        titulo: nome,
        turno: 'MANHA',
        professorMatricula: professor.matricula,
      });
    }
  });

  // Conta quantos SELECTs foram executados. Cada consulta recebe a função "logging".
  async function contarSelects(acao) {
    const sqls = [];
    const logging = (sql) => sqls.push(sql);
    await acao(logging);
    return sqls.filter((sql) => /SELECT/i.test(sql)).length;
  }

  it('o include (JOIN) carrega tudo em uma única consulta', async () => {
    const semInclude = await contarSelects(async (logging) => {
      const turmas = await Turma.findAll({ logging });
      for (const turma of turmas) {
        await turma.getProfessor({ logging }); // uma consulta extra POR turma
      }
    });

    const comInclude = await contarSelects(async (logging) => {
      await Turma.findAll({ include: [{ model: Professor, as: 'professor' }], logging });
    });

    console.log(`SELECTs sem include: ${semInclude} | com include: ${comInclude}`);
    assert.equal(comInclude, 1);
    assert.equal(semInclude, 4); // 1 das turmas + 3 dos professores
  });
});
