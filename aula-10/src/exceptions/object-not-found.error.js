// Erro lançado quando um registro não é encontrado.
// A propriedade "status" informa qual código HTTP deve ser devolvido (404).
export class ObjectNotFoundError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ObjectNotFoundError';
    this.status = 404;
  }
}
