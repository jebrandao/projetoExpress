// Não autenticado: faltou o login ou o login está errado (401)
export class UnauthorizedError extends Error {
  constructor(mensagem = 'Usuário ou senha inválidos') {
    super(mensagem);
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}
