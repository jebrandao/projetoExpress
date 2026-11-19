// Lê os parâmetros de paginação da query string (?pagina=0&itensPorPagina=5&ordenacao=nome&tipoOrdenacao=ASC).
// "camposPermitidos" evita que alguém ordene por uma coluna que não existe.
export function lerPaginacao(query, camposPermitidos) {
  const ordenacao = camposPermitidos.includes(query.ordenacao)
    ? query.ordenacao
    : camposPermitidos[0];

  return {
    pagina: Math.max(Number(query.pagina ?? 0) || 0, 0),
    itensPorPagina: Math.min(Math.max(Number(query.itensPorPagina ?? 5) || 5, 1), 100),
    ordenacao,
    tipoOrdenacao: String(query.tipoOrdenacao ?? 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
  };
}

// Monta a resposta paginada: os registros (content) e os dados da página (page)
export function montarPagina(conteudo, total, { pagina, itensPorPagina }) {
  return {
    content: conteudo,
    page: {
      size: itensPorPagina,
      number: pagina,
      totalElements: total,
      totalPages: Math.ceil(total / itensPorPagina),
    },
  };
}
