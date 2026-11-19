import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import { config } from '../../src/config/env.js';
import { prepararBanco, logar } from '../auxiliar.js';

describe('segurança com JWT (integração)', () => {
  let t; // tokens dos usuários de teste
  before(async () => {
    await prepararBanco({ comDados: true });
    t = await logar();
  });

  const login = (username, senha) => request(app).post('/auth/login').send({ username, senha });
  const comToken = (token) => ['Authorization', `Bearer ${token}`];
  const autoridades = ['ROLE_ADMIN', 'LEITURA', 'ESCRITA', 'USUARIOS'];

  // ---------- login

  it('login válido devolve um token JWT', async () => {
    const resposta = await login('admin', 'admin123');

    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.tipo, 'Bearer');
    assert.equal(resposta.body.expiraEmSegundos, 3600);
    assert.ok(resposta.body.token);
  });

  it('login com senha errada e login de usuário inexistente dão a mesma resposta', async () => {
    const senhaErrada = await login('admin', 'errada');
    const inexistente = await login('fantasma', 'qualquer123');

    assert.equal(senhaErrada.status, 401);
    assert.equal(inexistente.status, 401);
    assert.equal(senhaErrada.body.message, 'Usuário ou senha inválidos');
    assert.equal(inexistente.body.message, senhaErrada.body.message); // não revela quais usuários existem
  });

  it('o token carrega apenas as autoridades do negócio', async () => {
    const { token } = (await login('aluno', 'aluno123')).body;
    const conteudo = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());

    assert.equal(conteudo.sub, 'aluno');
    assert.deepEqual(conteudo.autoridades, ['ROLE_USER', 'LEITURA']);
  });

  // ---------- validação do token

  it('sem token retorna 401', async () => {
    assert.equal((await request(app).get('/estudantes')).status, 401);
  });

  it('token sem sentido retorna 401', async () => {
    const resposta = await request(app).get('/estudantes').set(...comToken('abc.def.ghi'));
    assert.equal(resposta.status, 401);
  });

  it('token adulterado retorna 401', async () => {
    const { token } = (await login('aluno', 'aluno123')).body;
    const [cabecalho, , assinatura] = token.split('.');
    const falso = Buffer.from(JSON.stringify({ sub: 'aluno', autoridades, iss: 'api-escola' })).toString('base64url');

    const resposta = await request(app).get('/estudantes').set(...comToken(`${cabecalho}.${falso}.${assinatura}`));
    assert.equal(resposta.status, 401);
  });

  it('token expirado retorna 401', async () => {
    const expirado = jwt.sign({ autoridades }, config.jwt.segredo, { subject: 'admin', issuer: 'api-escola', expiresIn: -60 });

    const resposta = await request(app).get('/estudantes').set(...comToken(expirado));
    assert.equal(resposta.status, 401);
    assert.equal(resposta.body.message, 'Token inválido ou expirado');
  });

  it('token assinado com outra chave retorna 401', async () => {
    const falso = jwt.sign({ autoridades }, 'outra-chave-secreta-com-mais-de-32-caracteres', { subject: 'admin', issuer: 'api-escola' });

    assert.equal((await request(app).get('/estudantes').set(...comToken(falso))).status, 401);
  });

  it('HTTP Basic não é mais aceito', async () => {
    const resposta = await request(app).get('/estudantes').auth('admin', 'admin123');
    assert.equal(resposta.status, 401);
  });

  // ---------- autorização por permissão

  it('USER lê, mas não escreve nem gerencia usuários', async () => {
    assert.equal((await request(app).get('/estudantes').set('Authorization', t.aluno)).status, 200);

    const escrita = await request(app).post('/estudantes').set('Authorization', t.aluno).send({ nome: 'X', email: 'x@x.com' });
    assert.equal(escrita.status, 403);

    assert.equal((await request(app).get('/usuarios').set('Authorization', t.aluno)).status, 403);
  });

  // ---------- cadastro de usuários

  it('o admin lista os usuários sem expor senhas', async () => {
    const resposta = await request(app).get('/usuarios').set('Authorization', t.admin);

    assert.equal(resposta.status, 200);
    const admin = resposta.body.find((u) => u.username === 'admin');
    assert.deepEqual(admin.papeis, ['ADMIN']);
    assert.equal('password' in admin, false);
    assert.equal('senha' in admin, false);
  });

  it('o admin cadastra um usuário, que então consegue fazer login', async () => {
    const criado = await request(app).post('/usuarios').set('Authorization', t.admin)
      .send({ username: 'secretaria', senha: 'senha-forte-1', papeis: ['USER'] });
    assert.equal(criado.status, 201);
    assert.deepEqual(criado.body.papeis, ['USER']);

    const { token } = (await login('secretaria', 'senha-forte-1')).body;
    const consulta = await request(app).get('/estudantes').set(...comToken(token));
    assert.equal(consulta.status, 200);
  });

  it('cadastro inválido retorna 400', async () => {
    const dados = { username: 'novo', senha: 'senha-forte-1', papeis: ['USER'] };
    const cadastrar = (corpo) => request(app).post('/usuarios').set('Authorization', t.admin).send(corpo);

    const invalido = await cadastrar({ username: 'novo', senha: '123', papeis: [] });
    assert.equal(invalido.status, 400);
    assert.equal(invalido.body.errors.length, 2);

    const papel = await cadastrar({ ...dados, papeis: ['DONO'] });
    assert.equal(papel.status, 400);
    assert.equal(papel.body.message, 'Papel inexistente: DONO');

    const repetido = await cadastrar({ ...dados, username: 'admin' });
    assert.equal(repetido.status, 400);
  });

  it('o auto-cadastro cria um usuário com o papel USER somente', async () => {
    const criado = await request(app).post('/auth/registrar').send({ username: 'visitante', senha: 'senha-forte-2' });
    assert.equal(criado.status, 201);
    assert.deepEqual(criado.body.papeis, ['USER']);

    const { token } = (await login('visitante', 'senha-forte-2')).body;
    assert.equal((await request(app).get('/estudantes').set(...comToken(token))).status, 200);
    assert.equal((await request(app).get('/usuarios').set(...comToken(token))).status, 403);
  });

  // ---------- CORS

  it('o CORS libera a origem configurada', async () => {
    const resposta = await request(app).options('/estudantes')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Authorization');

    assert.equal(resposta.status, 204);
    assert.equal(resposta.headers['access-control-allow-origin'], 'http://localhost:3000');
  });

  it('o CORS não libera uma origem desconhecida', async () => {
    const resposta = await request(app).options('/estudantes')
      .set('Origin', 'http://site-malicioso.com')
      .set('Access-Control-Request-Method', 'GET');

    assert.equal(resposta.headers['access-control-allow-origin'], undefined);
  });
});
