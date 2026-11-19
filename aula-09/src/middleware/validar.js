// Middleware de validação: confere o corpo da requisição contra um schema do Zod.
// Se estiver inválido, responde 400 com a lista de campos com problema.
// Se estiver válido, troca req.body pelos dados já limpos e segue para a rota.
export function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        status: 400,
        error: 'Validation error',
        message: 'Erro na validação de campo',
        path: req.originalUrl,
        errors: resultado.error.issues.map((problema) => ({
          fieldName: problema.path.join('.'),
          message: problema.message,
        })),
      });
    }

    req.body = resultado.data; // campos desconhecidos (como "id") são descartados
    next();
  };
}
