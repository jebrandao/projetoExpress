// Autenticado, mas sem permissão para a ação (403)
export class ForbiddenError extends Error {
  constructor(mensagem = 'Você não tem permissão para esta ação') {
    super(mensagem);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}
