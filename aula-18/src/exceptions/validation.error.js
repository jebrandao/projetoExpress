// Erro de validação: guarda a lista de campos que falharam.
// Cada item tem o formato { fieldName, message }.
export class ValidationError extends Error {
  constructor(erros = []) {
    super('Erro na validação de campo');
    this.name = 'ValidationError';
    this.status = 400;
    this.erros = erros;
  }

  adicionarErro(fieldName, message) {
    this.erros.push({ fieldName, message });
  }
}
