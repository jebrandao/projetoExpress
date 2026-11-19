// Violação de uma regra de negócio ou dado inválido que a validação do schema não detecta (400)
export class RegraNegocioError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'RegraNegocioError';
    this.status = 400;
  }
}
