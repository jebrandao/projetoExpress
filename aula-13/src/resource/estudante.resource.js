import { Router } from 'express';
import { estudanteService } from '../services/estudante.service.js';
import { estudanteSchema, paraEstudanteDTO } from '../dto/estudante.dto.js';
import { validar } from '../middleware/validar.js';
import { lerPaginacao, montarPagina } from '../commons/paginacao.js';

const router = Router();

/**
 * @openapi
 * /estudantes:
 *   get:
 *     tags: [Estudantes]
 *     summary: Retorna todos os estudantes
 *     responses:
 *       200: { description: Lista de estudantes }
 */
router.get('/', async (req, res) => {
  const estudantes = await estudanteService.buscarTodos();
  res.json(estudantes.map(paraEstudanteDTO));
});

/**
 * @openapi
 * /estudantes/paginacao:
 *   get:
 *     tags: [Estudantes]
 *     summary: Retorna os estudantes de forma paginada e ordenada
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, default: 0 } }
 *       - { in: query, name: itensPorPagina, schema: { type: integer, default: 5 } }
 *       - { in: query, name: ordenacao, schema: { type: string, default: nome } }
 *       - { in: query, name: tipoOrdenacao, schema: { type: string, enum: [ASC, DESC], default: ASC } }
 *     responses:
 *       200: { description: Uma página de estudantes }
 */
// Atenção: esta rota vem ANTES de "/:id", senão "paginacao" seria lido como um id
router.get('/paginacao', async (req, res) => {
  const opcoes = lerPaginacao(req.query, ['nome', 'sobreNome', 'email', 'dataNascimento', 'id']);
  const { conteudo, total } = await estudanteService.buscarPaginado(opcoes);
  res.json(montarPagina(conteudo.map(paraEstudanteDTO), total, opcoes));
});

/**
 * @openapi
 * /estudantes/{id}:
 *   get:
 *     tags: [Estudantes]
 *     summary: Retorna o registro do estudante pelo id
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200: { description: O estudante }
 *       404: { description: Estudante não encontrado }
 */
router.get('/:id', async (req, res) => {
  const estudante = await estudanteService.buscarPorId(req.params.id);
  res.json(paraEstudanteDTO(estudante));
});

/**
 * @openapi
 * /estudantes:
 *   post:
 *     tags: [Estudantes]
 *     summary: Cadastra um estudante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Estudante' }
 *     responses:
 *       201: { description: Estudante criado }
 *       400: { description: Dados inválidos }
 */
router.post('/', validar(estudanteSchema), async (req, res) => {
  const novo = await estudanteService.salvar(req.body);
  res.status(201).json(paraEstudanteDTO(novo));
});

/**
 * @openapi
 * /estudantes/{id}:
 *   put:
 *     tags: [Estudantes]
 *     summary: Altera o registro do estudante pelo id
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Estudante' }
 *     responses:
 *       200: { description: Estudante alterado }
 *       404: { description: Estudante não encontrado }
 */
router.put('/:id', validar(estudanteSchema), async (req, res) => {
  const atualizado = await estudanteService.atualizar(req.params.id, req.body);
  res.json(paraEstudanteDTO(atualizado));
});

/**
 * @openapi
 * /estudantes/{id}:
 *   delete:
 *     tags: [Estudantes]
 *     summary: Remove um estudante pelo id
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       204: { description: Estudante removido }
 *       404: { description: Estudante não encontrado }
 */
router.delete('/:id', async (req, res) => {
  await estudanteService.excluir(req.params.id);
  res.status(204).send();
});

export default router;
