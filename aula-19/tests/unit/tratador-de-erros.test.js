import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { tratadorDeErros } from '../../src/middleware/tratador-de-erros.js';
import { ObjectNotFoundError } from '../../src/exceptions/object-not-found.error.js';
import { ValidationError } from '../../src/exceptions/validation.error.js';
import { UnauthorizedError } from '../../src/exceptions/unauthorized.error.js';
import { ForbiddenError } from '../../src/exceptions/forbidden.error.js';

// Executa o tratador com uma "resposta" falsa e devolve o que ele enviou
function executar(erro) {
  const resposta = {
    headersSent: false,
    cabecalhos: {},
    status(codigo) { this.codigo = codigo; return this; },
    set(nome, valor) { this.cabecalhos[nome] = valor; return this; },
    json(corpo) { this.corpo = corpo; return this; },
  };
  tratadorDeErros(erro, { originalUrl: '/teste' }, resposta, () => {});
  return resposta;
}

describe('tratadorDeErros (unitário)', () => {
  it('ObjectNotFoundError vira 404', () => {
    const r = executar(new ObjectNotFoundError('Estudante não encontrado: id 9'));
    assert.equal(r.codigo, 404);
    assert.equal(r.corpo.message, 'Estudante não encontrado: id 9');
    assert.equal(r.corpo.path, '/teste');
    assert.ok(r.corpo.timeStamp > 0);
  });

  it('ValidationError vira 400 com a lista de campos', () => {
    const erro = new ValidationError();
    erro.adicionarErro('nome', 'O nome é obrigatório');
    const r = executar(erro);
    assert.equal(r.codigo, 400);
    assert.deepEqual(r.corpo.errors, [{ fieldName: 'nome', message: 'O nome é obrigatório' }]);
  });

  it('valor duplicado no banco vira 409', () => {
    const erro = new Error('UNIQUE constraint failed');
    erro.name = 'SequelizeUniqueConstraintError';
    assert.equal(executar(erro).codigo, 409);
  });

  it('JSON malformado vira 400', () => {
    const erro = new SyntaxError('Unexpected token');
    erro.type = 'entity.parse.failed';
    assert.equal(executar(erro).codigo, 400);
  });

  it('UnauthorizedError vira 401 e informa o tipo de autenticação (Bearer)', () => {
    const r = executar(new UnauthorizedError());
    assert.equal(r.codigo, 401);
    assert.match(r.cabecalhos['WWW-Authenticate'], /Bearer/);
  });

  it('ForbiddenError vira 403', () => {
    assert.equal(executar(new ForbiddenError()).codigo, 403);
  });

  it('erro inesperado vira 500 SEM vazar a mensagem interna', () => {
    const silencio = mock.method(console, 'error', () => {}); // o tratador registra o erro no console
    const r = executar(new Error('senha do banco: 1234'));
    silencio.mock.restore();

    assert.equal(r.codigo, 500);
    assert.equal(r.corpo.message, 'Erro inesperado no servidor');
    assert.doesNotMatch(JSON.stringify(r.corpo), /senha do banco/);
  });
});
