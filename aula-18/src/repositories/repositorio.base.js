// O repositório é a camada de acesso aos dados. As outras camadas não conhecem o Sequelize:
// pedem ao repositório o que precisam.
//
// Esta função cria um repositório com as operações básicas para qualquer model
// (é o papel que o JpaRepository tem no Spring Data).
//
// "include" informa quais relacionamentos devem ser carregados junto com o registro.
export function criarRepositorio(Modelo, { include = [] } = {}) {
  return {
    // INSERT (também grava os registros relacionados informados em "include")
    salvar: (dados) => Modelo.create(dados, { include }),

    // SELECT de todos os registros
    buscarTodos: () => Modelo.findAll({ include }),

    // SELECT pela chave primária (devolve null se não existir).
    // "opcoes" permite informar, por exemplo, a transação em andamento.
    buscarPorId: (id, opcoes = {}) => Modelo.findByPk(id, { include, ...opcoes }),

    // UPDATE de um registro já carregado
    atualizar: (entidade, dados) => entidade.update(dados),

    // DELETE de um registro já carregado
    remover: (entidade) => entidade.destroy(),

    // SELECT paginado e ordenado. "pagina" começa em 0.
    async buscarPaginado({ pagina, itensPorPagina, ordenacao, tipoOrdenacao }) {
      const { count, rows } = await Modelo.findAndCountAll({
        include,
        limit: itensPorPagina,
        offset: pagina * itensPorPagina,
        order: [[ordenacao, tipoOrdenacao]],
        distinct: true, // conta cada registro uma vez, mesmo com joins
      });
      return { conteudo: rows, total: count };
    },
  };
}
