import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { turmaService } from '../../src/services/turma.service.js';
import { turmaRepository } from '../../src/repositories/turma.repository.js';
import { professorService } from '../../src/services/professor.service.js';
import { estudanteService } from '../../src/services/estudante.service.js';
import { ObjectNotFoundError } from '../../src/exceptions/object-not-found.error.js';

describe('turmaService (unitário)', () => {
  afterEach(() => mock.restoreAll());

  it('deve matricular um estudante na turma', async () => {
    const adicionar = mock.fn(async () => {});
    const estudante = { id: 5 };
    mock.method(turmaRepository, 'buscarPorId', async () => ({ id: 1, addEstudante: adicionar }));
    mock.method(estudanteService, 'buscarPorId', async () => estudante);

    await turmaService.matricularEstudante(1, 5);

    assert.equal(adicionar.mock.callCount(), 1);
    assert.equal(adicionar.mock.calls[0].arguments[0], estudante);
  });

  it('deve conferir se o professor existe ao salvar a turma', async () => {
    const conferir = mock.method(professorService, 'buscarPorId', async () => ({ matricula: 7 }));
    mock.method(turmaRepository, 'salvar', async (dados) => ({ id: 1, ...dados }));
    mock.method(turmaRepository, 'buscarPorId', async () => ({ id: 1, professorMatricula: 7 }));

    await turmaService.salvar({ numero: '20240007', professorMatricula: 7 });

    assert.equal(conferir.mock.callCount(), 1);
    assert.equal(conferir.mock.calls[0].arguments[0], 7);
  });

  it('não deve salvar a turma quando o professor não existe', async () => {
    mock.method(professorService, 'buscarPorId', async () => {
      throw new ObjectNotFoundError('Professor não encontrado');
    });
    const salvar = mock.method(turmaRepository, 'salvar', async () => ({}));

    await assert.rejects(
      () => turmaService.salvar({ numero: '20240007', professorMatricula: 99 }),
      ObjectNotFoundError,
    );

    assert.equal(salvar.mock.callCount(), 0);
  });

  it('turma sem professor não consulta o serviço de professores', async () => {
    const conferir = mock.method(professorService, 'buscarPorId', async () => ({}));
    mock.method(turmaRepository, 'salvar', async (dados) => ({ id: 1, ...dados }));
    mock.method(turmaRepository, 'buscarPorId', async () => ({ id: 1 }));

    await turmaService.salvar({ numero: '20240007' });

    assert.equal(conferir.mock.callCount(), 0);
  });
});
