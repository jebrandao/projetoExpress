import { tokenService } from '../services/token.service.js';
import { UnauthorizedError } from '../exceptions/unauthorized.error.js';
import { ForbiddenError } from '../exceptions/forbidden.error.js';

// ---------------------------------------------------------------------------
// AUTENTICAÇÃO: descobrir QUEM é o usuário, a partir do token JWT.
// O cliente faz login uma vez (POST /auth/login) e depois envia em cada requisição:
//   Authorization: Bearer <token>
// A validação não consulta o banco: a assinatura prova que o token foi emitido por nós.
// ---------------------------------------------------------------------------
export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization ?? '';

  if (!cabecalho.startsWith('Bearer ')) {
    throw new UnauthorizedError('Autenticação necessária');
  }

  req.usuario = tokenService.validar(cabecalho.slice(7)); // { username, autoridades }
  next();
}

// ---------------------------------------------------------------------------
// AUTORIZAÇÃO: decidir o que o usuário PODE fazer, com base nas autoridades do token
// ---------------------------------------------------------------------------
export function exigirAutoridade(autoridade) {
  return (req, res, next) => {
    if (!req.usuario.autoridades.includes(autoridade)) {
      throw new ForbiddenError();
    }
    next();
  };
}

const METODOS_DE_LEITURA = ['GET', 'HEAD', 'OPTIONS'];

// Regra dos recursos da escola: leitura exige a permissão LEITURA; escrita exige ESCRITA
export function regrasPorMetodo(req, res, next) {
  const autoridade = METODOS_DE_LEITURA.includes(req.method) ? 'LEITURA' : 'ESCRITA';
  return exigirAutoridade(autoridade)(req, res, next);
}
