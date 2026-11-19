// Middleware: função que roda ANTES da rota e pode olhar (ou alterar) a requisição e a resposta.
// Este registra, no console, o método, o caminho, o status e o tempo de cada requisição.
export function logger(req, res, next) {
  const inicio = Date.now();

  // "finish" é disparado quando a resposta termina de ser enviada
  res.on('finish', () => {
    const tempo = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${tempo} ms)`);
  });

  next(); // passa a requisição para o próximo middleware ou rota
}
