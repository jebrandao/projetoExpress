import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { tokenService } from '../../src/services/token.service.js';
import { usuarioService } from '../../src/services/usuario.service.js';
import { config } from '../../src/config/env.js';
import { UnauthorizedError } from '../../src/exceptions/unauthorized.error.js';

describe('tokenService (unitário)', () => {
  const autoridades = ['ROLE_ADMIN', 'LEITURA', 'ESCRITA'];

  it('gera um token que pode ser validado de volta', () => {
    const { token, tipo, expiraEmSegundos } = tokenService.gerarToken('admin', autoridades);

    assert.equal(tipo, 'Bearer');
    assert.equal(expiraEmSegundos, 3600);
    assert.deepEqual(tokenService.validar(token), { username: 'admin', autoridades });
  });

  it('o token tem três partes e o conteúdo é legível (não é criptografado)', () => {
    const { token } = tokenService.gerarToken('admin', autoridades);
    const partes = token.split('.');

    assert.equal(partes.length, 3);
    const conteudo = JSON.parse(Buffer.from(partes[1], 'base64url').toString());
    assert.equal(conteudo.sub, 'admin');
    assert.equal(conteudo.iss, 'api-escola');
  });

  it('recusa um token cujo conteúdo foi alterado', () => {
    const { token } = tokenService.gerarToken('aluno', ['LEITURA']);
    const [cabecalho, , assinatura] = token.split('.');
    const falso = Buffer.from(JSON.stringify({ sub: 'aluno', autoridades: ['ESCRITA'], iss: 'api-escola' })).toString('base64url');

    assert.throws(() => tokenService.validar(`${cabecalho}.${falso}.${assinatura}`), UnauthorizedError);
  });

  it('recusa um token expirado', () => {
    const expirado = jwt.sign({ autoridades }, config.jwt.segredo, { subject: 'admin', issuer: 'api-escola', expiresIn: -60 });

    assert.throws(() => tokenService.validar(expirado), UnauthorizedError);
  });

  it('recusa um token assinado com outra chave', () => {
    const falso = jwt.sign({ autoridades }, 'uma-outra-chave-secreta-com-mais-de-32-caracteres', {
      subject: 'admin',
      issuer: 'api-escola',
    });

    assert.throws(() => tokenService.validar(falso), UnauthorizedError);
  });

  it('recusa um texto qualquer', () => {
    assert.throws(() => tokenService.validar('isto-nao-e-um-token'), UnauthorizedError);
  });
});

describe('usuarioService.autoridadesDe (unitário)', () => {
  it('papéis viram ROLE_xxx e permissões viram autoridades, sem repetição', () => {
    const usuario = {
      papeis: [
        { nome: 'ADMIN', permissoes: [{ nome: 'LEITURA' }, { nome: 'ESCRITA' }] },
        { nome: 'USER', permissoes: [{ nome: 'LEITURA' }] },
      ],
    };

    assert.deepEqual(usuarioService.autoridadesDe(usuario), ['ROLE_ADMIN', 'LEITURA', 'ESCRITA', 'ROLE_USER']);
  });
});
