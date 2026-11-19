// Último middleware da cadeia: só é alcançado quando nenhuma rota respondeu
export function naoEncontrado(req, res) {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}
