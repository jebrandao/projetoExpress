import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';
import { ValidationError } from '../exceptions/validation.error.js';
import { UnauthorizedError } from '../exceptions/unauthorized.error.js';
import { ForbiddenError } from '../exceptions/forbidden.error.js';

// Descobre, a partir do tipo do erro, qual resposta HTTP devolver
function traduzir(erro) {
  if (erro instanceof ObjectNotFoundError) {
    return { status: 404, error: 'Object not found', message: erro.message };
  }

  if (erro instanceof ValidationError) {
    return { status: 400, error: 'Validation error', message: erro.message, errors: erro.erros };
  }

  if (erro instanceof UnauthorizedError) {
    return { status: 401, error: 'Unauthorized', message: erro.message };
  }

  if (erro instanceof ForbiddenError) {
    return { status: 403, error: 'Forbidden', message: erro.message };
  }

  // Erros do Sequelize: valor duplicado (unique) ou registro em uso (chave estrangeira)
  if (erro.name === 'SequelizeUniqueConstraintError' || erro.name === 'SequelizeForeignKeyConstraintError') {
    return {
      status: 409,
      error: 'Data integrity violation',
      message: 'Valor duplicado ou registro em uso por outro registro',
    };
  }

  // O model recusou o valor (ex.: ENUM inválido, campo obrigatório)
  if (erro.name === 'SequelizeValidationError') {
    return {
      status: 400,
      error: 'Validation error',
      message: 'Erro na validação de campo',
      errors: erro.errors.map((e) => ({ fieldName: e.path, message: e.message })),
    };
  }

  // JSON malformado no corpo da requisição (erro lançado pelo express.json)
  if (erro.type === 'entity.parse.failed') {
    return { status: 400, error: 'Bad request', message: 'O corpo da requisição não é um JSON válido' };
  }

  // Qualquer outro erro é inesperado: registramos no console e devolvemos uma mensagem genérica
  console.error(erro);
  return { status: 500, error: 'Internal server error', message: 'Erro inesperado no servidor' };
}

// Um middleware com QUATRO parâmetros (err, req, res, next) é um tratador de erros.
// Precisa ser registrado por último, depois de todas as rotas.
export function tratadorDeErros(erro, req, res, next) {
  if (res.headersSent) {
    return next(erro);
  }

  const { status, error, message, errors } = traduzir(erro);

  // Diz ao cliente qual tipo de autenticação o servidor aceita
  if (status === 401) {
    res.set('WWW-Authenticate', 'Basic realm="API Escola"');
  }

  res.status(status).json({
    timeStamp: Date.now(),
    status,
    error,
    message,
    path: req.originalUrl,
    ...(errors && { errors }),
  });
}
