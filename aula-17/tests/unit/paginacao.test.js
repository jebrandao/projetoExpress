import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lerPaginacao, montarPagina } from '../../src/commons/paginacao.js';

const campos = ['nome', 'email', 'id'];

describe('paginação (unitário)', () => {
  it('usa valores padrão quando nada é informado', () => {
    assert.deepEqual(lerPaginacao({}, campos), {
      pagina: 0,
      itensPorPagina: 5,
      ordenacao: 'nome',
      tipoOrdenacao: 'ASC',
    });
  });

  it('lê os parâmetros informados', () => {
    const opcoes = lerPaginacao({ pagina: '2', itensPorPagina: '10', ordenacao: 'email', tipoOrdenacao: 'desc' }, campos);
    assert.deepEqual(opcoes, { pagina: 2, itensPorPagina: 10, ordenacao: 'email', tipoOrdenacao: 'DESC' });
  });

  it('ignora uma coluna de ordenação que não é permitida', () => {
    assert.equal(lerPaginacao({ ordenacao: 'senha; DROP TABLE' }, campos).ordenacao, 'nome');
  });

  it('limita o tamanho da página e impede valores negativos', () => {
    const opcoes = lerPaginacao({ pagina: '-3', itensPorPagina: '5000' }, campos);
    assert.equal(opcoes.pagina, 0);
    assert.equal(opcoes.itensPorPagina, 100);
  });

  it('monta o total de páginas arredondando para cima', () => {
    const resposta = montarPagina([1, 2], 7, { pagina: 1, itensPorPagina: 3 });
    assert.deepEqual(resposta.page, { size: 3, number: 1, totalElements: 7, totalPages: 3 });
    assert.deepEqual(resposta.content, [1, 2]);
  });
});
