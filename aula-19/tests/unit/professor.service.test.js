import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { professorService } from '../../src/services/professor.service.js';
import { professorRepository } from '../../src/repositories/professor.repository.js';
import { ObjectNotFoundError } from '../../src/exceptions/object-not-found.error.js';

describe('professorService (unitário)', () => {
  afterEach(() => mock.restoreAll());

  it('deve listar todos os professores', async () => {
    mock.method(professorRepository, 'buscarTodos', async () => [{ matricula: 1 }, { matricula: 2 }]);

    const lista = await professorService.buscarTodos();

    assert.equal(lista.length, 2);
  });

  it('deve buscar o professor pela matrícula', async () => {
    mock.method(professorRepository, 'buscarPorId', async () => ({ matricula: 1, nome: 'Marta' }));

    const professor = await professorService.buscarPorId(1);

    assert.equal(professor.nome, 'Marta');
  });

  it('deve lançar erro quando a matrícula não existe', async () => {
    mock.method(professorRepository, 'buscarPorId', async () => null);

    await assert.rejects(() => professorService.buscarPorId(99), ObjectNotFoundError);
  });

  it('deve atualizar os dados do professor', async () => {
    const existente = { matricula: 1, nome: 'Marta' };
    mock.method(professorRepository, 'buscarPorId', async () => existente);
    const atualizar = mock.method(professorRepository, 'atualizar', async (entidade, dados) => ({ ...entidade, ...dados }));

    const atualizado = await professorService.atualizar(1, { nome: 'Marta Souza' });

    assert.equal(atualizado.nome, 'Marta Souza');
    assert.equal(atualizar.mock.callCount(), 1);
  });

  it('deve excluir um professor existente', async () => {
    const existente = { matricula: 1 };
    mock.method(professorRepository, 'buscarPorId', async () => existente);
    const remover = mock.method(professorRepository, 'remover', async () => {});

    await professorService.excluir(1);

    assert.deepEqual(remover.mock.calls[0].arguments[0], existente);
  });
});
