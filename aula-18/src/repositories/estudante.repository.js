import { Op } from 'sequelize';
import { Endereco, Estudante, Turma } from '../models/index.js';
import { criarRepositorio } from './repositorio.base.js';

const incluirEndereco = { model: Endereco, as: 'endereco' };

// O endereço é carregado e gravado junto com o estudante
export const estudanteRepository = {
  ...criarRepositorio(Estudante, { include: [incluirEndereco] }),

  // Consulta dinâmica: só aplica os filtros que foram informados.
  // Op.like = LIKE do SQL; Op.gte = "maior ou igual".
  async buscarComFiltros({ nome, nascidoApos, turmaId, pagina, itensPorPagina }) {
    const where = {};
    if (nome) {
      where.nome = { [Op.like]: `%${nome}%` };
    }
    if (nascidoApos) {
      where.dataNascimento = { [Op.gte]: nascidoApos };
    }

    const include = [incluirEndereco];
    if (turmaId) {
      // "required: true" vira um INNER JOIN: só entram estudantes matriculados nessa turma
      include.push({
        model: Turma,
        as: 'turmas',
        where: { id: turmaId },
        attributes: [],
        through: { attributes: [] },
        required: true,
      });
    }

    const { count, rows } = await Estudante.findAndCountAll({
      where,
      include,
      order: [['nome', 'ASC']],
      limit: itensPorPagina,
      offset: pagina * itensPorPagina,
      distinct: true,
    });
    return { conteudo: rows, total: count };
  },
};
