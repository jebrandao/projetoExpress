import { ObjectNotFoundError } from '../exceptions/object-not-found.error.js';

// Último middleware da cadeia: só é alcançado quando nenhuma rota respondeu.
// Em vez de responder aqui, lança o erro e deixa o tratador de erros montar o JSON.
export function naoEncontrado(req, res) {
  throw new ObjectNotFoundError(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
}
