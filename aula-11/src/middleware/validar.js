import { ValidationError } from '../exceptions/validation.error.js';

// Middleware de validação: confere o corpo da requisição contra um schema do Zod.
// Se estiver inválido, lança um ValidationError (o tratador de erros monta o JSON 400).
// Se estiver válido, troca req.body pelos dados já limpos e segue para a rota.
export function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const erro = new ValidationError();
      for (const problema of resultado.error.issues) {
        erro.adicionarErro(problema.path.join('.'), problema.message);
      }
      throw erro;
    }

    req.body = resultado.data; // campos desconhecidos (como "id") são descartados
    next();
  };
}
