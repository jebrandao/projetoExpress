import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { estudanteService } from '../../src/services/estudante.service.js';
import { estudanteRepository } from '../../src/repositories/estudante.repository.js';
import { ObjectNotFoundError } from '../../src/exceptions/object-not-found.error.js';
import { ConflictError } from '../../src/exceptions/conflict.error.js';

// Teste unitário: o repositório é substituído por um "dublê" (mock),
// então o banco de dados nem é usado.
describe('estudanteService (unitário)', () => {
  afterEach(() => mock.restoreAll()); // desfaz os mocks depois de cada teste

  it('deve salvar um estudante', async () => {
    const salvar = mock.method(estudanteRepository, 'salvar', async (dados) => ({ id: 1, ...dados }));

    const salvo = await estudanteService.salvar({ nome: 'Ana', email: 'ana@email.com' });

    assert.equal(salvo.id, 1);
    assert.equal(salvar.mock.callCount(), 1);
    assert.deepEqual(salvar.mock.calls[0].arguments[0], { nome: 'Ana', email: 'ana@email.com' });
  });

  it('deve buscar um estudante pelo id', async () => {
    mock.method(estudanteRepository, 'buscarPorId', async () => ({ id: 1, nome: 'Ana' }));

    const encontrado = await estudanteService.buscarPorId(1);

    assert.equal(encontrado.nome, 'Ana');
  });

  it('deve lançar ObjectNotFoundError quando o id não existe', async () => {
    mock.method(estudanteRepository, 'buscarPorId', async () => null);

    await assert.rejects(
      () => estudanteService.buscarPorId(99),
      (erro) => {
        assert.ok(erro instanceof ObjectNotFoundError);
        assert.match(erro.message, /99/);
        assert.equal(erro.status, 404);
        return true;
      },
    );
  });

  it('deve atualizar os campos do estudante', async () => {
    const existente = { id: 1, nome: 'Ana', endereco: null };
    mock.method(estudanteRepository, 'buscarPorId', async () => existente);
    const atualizar = mock.method(estudanteRepository, 'atualizar', async () => existente);

    await estudanteService.atualizar(1, { nome: 'Ana Maria', email: 'ana@email.com' });

    assert.equal(atualizar.mock.callCount(), 1);
    assert.deepEqual(atualizar.mock.calls[0].arguments[1], { nome: 'Ana Maria', email: 'ana@email.com' });
  });

  it('deve rejeitar a atualização feita com uma versão desatualizada', async () => {
    const existente = { id: 1, versao: 3, endereco: null };
    mock.method(estudanteRepository, 'buscarPorId', async () => existente);
    const atualizar = mock.method(estudanteRepository, 'atualizar', async () => existente);

    await assert.rejects(
      () => estudanteService.atualizar(1, { nome: 'Ana', versao: 2 }), // o cliente leu a versão 2, mas o banco está na 3
      ConflictError,
    );

    assert.equal(atualizar.mock.callCount(), 0);
  });

  it('não deve excluir um estudante inexistente', async () => {
    mock.method(estudanteRepository, 'buscarPorId', async () => null);
    const remover = mock.method(estudanteRepository, 'remover', async () => {});

    await assert.rejects(() => estudanteService.excluir(99), ObjectNotFoundError);

    assert.equal(remover.mock.callCount(), 0); // nada foi removido
  });

  it('a exclusão é lógica: remove o estudante, mas mantém o endereço', async () => {
    const destruirEndereco = mock.fn(async () => {});
    const existente = { id: 1, endereco: { destroy: destruirEndereco } };
    mock.method(estudanteRepository, 'buscarPorId', async () => existente);
    const remover = mock.method(estudanteRepository, 'remover', async () => {});

    await estudanteService.excluir(1);

    assert.equal(remover.mock.callCount(), 1);
    assert.equal(destruirEndereco.mock.callCount(), 0); // o endereço continua existindo
  });
});
