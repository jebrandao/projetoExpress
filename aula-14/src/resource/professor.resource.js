import { Router } from 'express';
import { professorService } from '../services/professor.service.js';
import { professorSchema, paraProfessorDTO } from '../dto/professor.dto.js';
import { validar } from '../middleware/validar.js';
import { lerPaginacao, montarPagina } from '../commons/paginacao.js';

const router = Router();

/**
 * @openapi
 * /professores:
 *   get:
 *     tags: [Professores]
 *     summary: Retorna todos os professores
 *     responses:
 *       200: { description: Lista de professores }
 */
router.get('/', async (req, res) => {
  const professores = await professorService.buscarTodos();
  res.json(professores.map(paraProfessorDTO));
});

/**
 * @openapi
 * /professores/paginacao:
 *   get:
 *     tags: [Professores]
 *     summary: Retorna os professores de forma paginada e ordenada
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, default: 0 } }
 *       - { in: query, name: itensPorPagina, schema: { type: integer, default: 5 } }
 *       - { in: query, name: ordenacao, schema: { type: string, default: nome } }
 *       - { in: query, name: tipoOrdenacao, schema: { type: string, enum: [ASC, DESC], default: ASC } }
 *     responses:
 *       200: { description: Uma página de professores }
 */
router.get('/paginacao', async (req, res) => {
  const opcoes = lerPaginacao(req.query, ['nome', 'especializacao', 'telefone', 'matricula']);
  const { conteudo, total } = await professorService.buscarPaginado(opcoes);
  res.json(montarPagina(conteudo.map(paraProfessorDTO), total, opcoes));
});

/**
 * @openapi
 * /professores/{id}:
 *   get:
 *     tags: [Professores]
 *     summary: Retorna o registro do professor pela matrícula
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200: { description: O professor }
 *       404: { description: Professor não encontrado }
 */
router.get('/:id', async (req, res) => {
  const professor = await professorService.buscarPorId(req.params.id);
  res.json(paraProfessorDTO(professor));
});

/**
 * @openapi
 * /professores:
 *   post:
 *     tags: [Professores]
 *     summary: Cadastra um professor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Professor' }
 *     responses:
 *       201: { description: Professor criado }
 *       400: { description: Dados inválidos }
 */
router.post('/', validar(professorSchema), async (req, res) => {
  const novo = await professorService.salvar(req.body);
  res.status(201).json(paraProfessorDTO(novo));
});

/**
 * @openapi
 * /professores/{id}:
 *   put:
 *     tags: [Professores]
 *     summary: Altera o registro do professor pela matrícula
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Professor' }
 *     responses:
 *       200: { description: Professor alterado }
 *       404: { description: Professor não encontrado }
 */
router.put('/:id', validar(professorSchema), async (req, res) => {
  const atualizado = await professorService.atualizar(req.params.id, req.body);
  res.json(paraProfessorDTO(atualizado));
});

/**
 * @openapi
 * /professores/{id}:
 *   delete:
 *     tags: [Professores]
 *     summary: Remove um professor pela matrícula
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       204: { description: Professor removido }
 *       404: { description: Professor não encontrado }
 */
router.delete('/:id', async (req, res) => {
  await professorService.excluir(req.params.id);
  res.status(204).send();
});

export default router;
