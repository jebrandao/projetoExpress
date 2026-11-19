import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { prepararBanco } from '../auxiliar.js';
import { turmaRepository } from '../../src/repositories/turma.repository.js';
import { usuarioRepository } from '../../src/repositories/usuario.repository.js';

// Teste de repositório: usa o banco SQLite em memória (sem mocks)
describe('repositórios (banco em memória)', () => {
  before(() => prepararBanco());

  const novaTurma = (numero) => ({ numero, titulo: 'Redes', turno: 'MANHA' });

  it('deve salvar e buscar uma turma', async () => {
    const salva = await turmaRepository.salvar(novaTurma('20250001'));

    assert.ok(salva.id);
    const encontrada = await turmaRepository.buscarPorId(salva.id);
    assert.equal(encontrada.numero, '20250001');
  });

  it('não deve permitir duas turmas com o mesmo número', async () => {
    await turmaRepository.salvar(novaTurma('20250002'));

    await assert.rejects(
      () => turmaRepository.salvar(novaTurma('20250002')),
      (erro) => erro.name === 'SequelizeUniqueConstraintError',
    );
  });

  it('não deve aceitar um turno fora da lista', async () => {
    await assert.rejects(
      () => turmaRepository.salvar({ numero: '20250003', turno: 'MADRUGADA' }),
      (erro) => erro.name === 'SequelizeValidationError',
    );
  });

  it('deve paginar e ordenar', async () => {
    const { conteudo, total } = await turmaRepository.buscarPaginado({
      pagina: 0,
      itensPorPagina: 1,
      ordenacao: 'numero',
      tipoOrdenacao: 'DESC',
    });

    assert.equal(conteudo.length, 1);
    assert.equal(conteudo[0].numero, '20250002'); // o maior número
    assert.ok(total >= 2);
  });

  it('deve encontrar o usuário pelo username', async () => {
    await usuarioRepository.salvar({ username: 'maria', password: 'hash-qualquer', perfil: 'USER' });

    const encontrado = await usuarioRepository.buscarPorUsername('maria');

    assert.equal(encontrado.perfil, 'USER');
    assert.equal(await usuarioRepository.buscarPorUsername('fantasma'), null);
  });
});
