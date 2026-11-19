import { Router } from 'express';
import { turmaService } from '../services/turma.service.js';
import { turmaSchema, paraTurmaDTO } from '../dto/turma.dto.js';
import { validar } from '../middleware/validar.js';
import { lerPaginacao, montarPagina } from '../commons/paginacao.js';

const router = Router();

/**
 * @openapi
 * /turmas:
 *   get:
 *     tags: [Turmas]
 *     summary: Retorna todas as turmas
 *     responses:
 *       200: { description: Lista de turmas }
 */
router.get('/', async (req, res) => {
  const turmas = await turmaService.buscarTodos();
  res.json(turmas.map(paraTurmaDTO));
});

/**
 * @openapi
 * /turmas/paginacao:
 *   get:
 *     tags: [Turmas]
 *     summary: Retorna as turmas de forma paginada e ordenada
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, default: 0 } }
 *       - { in: query, name: itensPorPagina, schema: { type: integer, default: 5 } }
 *       - { in: query, name: ordenacao, schema: { type: string, default: titulo } }
 *       - { in: query, name: tipoOrdenacao, schema: { type: string, enum: [ASC, DESC], default: ASC } }
 *     responses:
 *       200: { description: Uma página de turmas }
 */
router.get('/paginacao', async (req, res) => {
  const opcoes = lerPaginacao(req.query, ['titulo', 'numero', 'turno', 'id']);
  const { conteudo, total } = await turmaService.buscarPaginado(opcoes);
  res.json(montarPagina(conteudo.map(paraTurmaDTO), total, opcoes));
});

/**
 * @openapi
 * /turmas/{id}:
 *   get:
 *     tags: [Turmas]
 *     summary: Retorna o registro da turma pelo id
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200: { description: A turma }
 *       404: { description: Turma não encontrada }
 */
router.get('/:id', async (req, res) => {
  const turma = await turmaService.buscarPorId(req.params.id);
  res.json(paraTurmaDTO(turma));
});

/**
 * @openapi
 * /turmas:
 *   post:
 *     tags: [Turmas]
 *     summary: Cadastra uma turma
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Turma' }
 *     responses:
 *       201: { description: Turma criada }
 *       400: { description: Dados inválidos }
 */
router.post('/', validar(turmaSchema), async (req, res) => {
  const nova = await turmaService.salvar(req.body);
  res.status(201).json(paraTurmaDTO(nova));
});

/**
 * @openapi
 * /turmas/{id}:
 *   put:
 *     tags: [Turmas]
 *     summary: Altera o registro da turma pelo id
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Turma' }
 *     responses:
 *       200: { description: Turma alterada }
 *       404: { description: Turma não encontrada }
 */
router.put('/:id', validar(turmaSchema), async (req, res) => {
  const atualizada = await turmaService.atualizar(req.params.id, req.body);
  res.json(paraTurmaDTO(atualizada));
});

/**
 * @openapi
 * /turmas/{id}:
 *   delete:
 *     tags: [Turmas]
 *     summary: Remove uma turma pelo id
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       204: { description: Turma removida }
 *       404: { description: Turma não encontrada }
 */
router.delete('/:id', async (req, res) => {
  await turmaService.excluir(req.params.id);
  res.status(204).send();
});

export default router;
