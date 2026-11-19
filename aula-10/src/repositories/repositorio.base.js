// O repositório é a camada de acesso aos dados. As outras camadas não conhecem o Sequelize:
// pedem ao repositório o que precisam.
//
// Esta função cria um repositório com as operações básicas para qualquer model
// (é o papel que o JpaRepository tem no Spring Data).
export function criarRepositorio(Modelo) {
  return {
    // INSERT
    salvar: (dados) => Modelo.create(dados),

    // SELECT de todos os registros
    buscarTodos: () => Modelo.findAll(),

    // SELECT pela chave primária (devolve null se não existir)
    buscarPorId: (id) => Modelo.findByPk(id),

    // UPDATE de um registro já carregado
    atualizar: (entidade, dados) => entidade.update(dados),

    // DELETE de um registro já carregado
    remover: (entidade) => entidade.destroy(),

    // SELECT paginado e ordenado. "pagina" começa em 0.
    async buscarPaginado({ pagina, itensPorPagina, ordenacao, tipoOrdenacao }) {
      const { count, rows } = await Modelo.findAndCountAll({
        limit: itensPorPagina,
        offset: pagina * itensPorPagina,
        order: [[ordenacao, tipoOrdenacao]],
      });
      return { conteudo: rows, total: count };
    },
  };
}
