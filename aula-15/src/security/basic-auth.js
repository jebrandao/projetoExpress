import { usuarioService } from '../services/usuario.service.js';
import { UnauthorizedError } from '../exceptions/unauthorized.error.js';
import { ForbiddenError } from '../exceptions/forbidden.error.js';

// ---------------------------------------------------------------------------
// AUTENTICAÇÃO: descobrir QUEM é o usuário (HTTP Basic)
// A cada requisição o cliente envia o cabeçalho:
//   Authorization: Basic base64("usuario:senha")
// Base64 é só uma codificação, não é criptografia: em produção use sempre HTTPS.
// ---------------------------------------------------------------------------
export async function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization ?? '';

  if (!cabecalho.startsWith('Basic ')) {
    throw new UnauthorizedError('Autenticação necessária');
  }

  const credenciais = Buffer.from(cabecalho.slice(6), 'base64').toString('utf8');
  const posicao = credenciais.indexOf(':');
  const username = credenciais.slice(0, posicao);
  const senha = credenciais.slice(posicao + 1);

  const usuario = await usuarioService.autenticar(username, senha);
  if (!usuario) {
    // Mensagem genérica: não revela se foi o usuário ou a senha que estava errado
    throw new UnauthorizedError();
  }

  req.usuario = { id: usuario.id, username: usuario.username, perfil: usuario.perfil };
  next();
}

// ---------------------------------------------------------------------------
// AUTORIZAÇÃO: decidir o que o usuário PODE fazer
// ---------------------------------------------------------------------------
export function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      throw new ForbiddenError();
    }
    next();
  };
}

const METODOS_DE_LEITURA = ['GET', 'HEAD', 'OPTIONS'];

// Regra do projeto: leitura para qualquer usuário autenticado; escrita somente para ADMIN
export function regrasPorMetodo(req, res, next) {
  const perfis = METODOS_DE_LEITURA.includes(req.method) ? ['ADMIN', 'USER'] : ['ADMIN'];
  return autorizar(...perfis)(req, res, next);
}
