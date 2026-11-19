import { Router } from 'express';
import { turmaService } from '../services/turma.service.js';
import { paraEstudanteDTO } from '../dto/estudante.dto.js';
import { turmaSchema, paraTurmaDTO } from '../dto/turma.dto.js';
import { validar } from '../middleware/validar.js';
import { ValidationError } from '../exceptions/validation.error.js';
import { lerPaginacao, montarPagina } from '../commons/paginacao.js';

const router = Router();

/**
 * @openapi
 * /turmas:
 *   get:
 *     tags: [Turmas]
 *     summary: Retorna todas as turmas (opcionalmente, só as de um turno)
 *     parameters:
 *       - { in: query, name: turno, schema: { type: string, enum: [MANHA, TARDE, NOITE] } }
 *     responses:
 *       200: { description: Lista de turmas }
 *       400: { description: Turno inválido }
 */
router.get('/', async (req, res) => {
  const { turno } = req.query;

  if (turno && !['MANHA', 'TARDE', 'NOITE'].includes(turno)) {
    const erro = new ValidationError();
    erro.adicionarErro('turno', 'O turno deve ser MANHA, TARDE ou NOITE');
    throw erro;
  }

  const turmas = await turmaService.buscarTodos(turno);
  res.json(turmas.map(paraTurmaDTO));
});

/**
 * @openapi
 * /turmas/resumo:
 *   get:
 *     tags: [Turmas]
 *     summary: Resumo das turmas com o professor e o total de estudantes
 *     responses:
 *       200: { description: Relatório de turmas }
 */
router.get('/resumo', async (req, res) => {
  res.json(await turmaService.resumoDasTurmas());
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

/**
 * @openapi
 * /turmas/{id}/estudantes:
 *   get:
 *     tags: [Turmas]
 *     summary: Lista os estudantes matriculados na turma
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200: { description: Estudantes da turma }
 *       404: { description: Turma não encontrada }
 */
router.get('/:id/estudantes', async (req, res) => {
  const estudantes = await turmaService.buscarEstudantesDaTurma(req.params.id);
  res.json(estudantes.map(paraEstudanteDTO));
});

/**
 * @openapi
 * /turmas/{id}/estudantes/{estudanteId}:
 *   post:
 *     tags: [Turmas]
 *     summary: Matricula um estudante na turma
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - { in: path, name: estudanteId, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Estudante matriculado }
 *       404: { description: Turma ou estudante não encontrado }
 */
router.post('/:id/estudantes/:estudanteId', async (req, res) => {
  await turmaService.matricularEstudante(req.params.id, req.params.estudanteId);
  res.status(204).send();
});

/**
 * @openapi
 * /turmas/{id}/estudantes/{estudanteId}:
 *   delete:
 *     tags: [Turmas]
 *     summary: Remove a matrícula de um estudante da turma
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - { in: path, name: estudanteId, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Matrícula removida }
 *       404: { description: Turma ou estudante não encontrado }
 */
router.delete('/:id/estudantes/:estudanteId', async (req, res) => {
  await turmaService.desmatricularEstudante(req.params.id, req.params.estudanteId);
  res.status(204).send();
});

/**
 * @openapi
 * /turmas/{id}/estudantes/{estudanteId}/transferir/{destinoId}:
 *   post:
 *     tags: [Turmas]
 *     summary: Transfere um estudante para outra turma (operação atômica)
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - { in: path, name: estudanteId, required: true, schema: { type: integer } }
 *       - { in: path, name: destinoId, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Estudante transferido }
 *       404: { description: Turma ou estudante não encontrado (nada é alterado) }
 */
router.post('/:id/estudantes/:estudanteId/transferir/:destinoId', async (req, res) => {
  await turmaService.transferirEstudante(req.params.id, req.params.destinoId, req.params.estudanteId);
  res.status(204).send();
});

export default router;
