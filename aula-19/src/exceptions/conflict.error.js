// Conflito: o registro foi alterado por outra pessoa enquanto você o editava (409)
export class ConflictError extends Error {
  constructor(mensagem = 'O registro foi alterado por outra pessoa. Recarregue e tente de novo') {
    super(mensagem);
    this.name = 'ConflictError';
    this.status = 409;
  }
}
