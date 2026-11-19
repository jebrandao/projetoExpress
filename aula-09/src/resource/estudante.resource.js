import { Router } from 'express';
import { estudanteService } from '../services/estudante.service.js';
import { estudanteSchema, paraEstudanteDTO } from '../dto/estudante.dto.js';
import { validar } from '../middleware/validar.js';

const router = Router();

// GET /estudantes
router.get('/', async (req, res) => {
  const estudantes = await estudanteService.buscarTodos();
  res.json(estudantes.map(paraEstudanteDTO));
});

// GET /estudantes/1
router.get('/:id', async (req, res) => {
  const estudante = await estudanteService.buscarPorId(req.params.id);
  res.json(paraEstudanteDTO(estudante));
});

// POST /estudantes  (o middleware "validar" roda antes da rota)
router.post('/', validar(estudanteSchema), async (req, res) => {
  const novo = await estudanteService.salvar(req.body);
  res.status(201).json(paraEstudanteDTO(novo));
});

// PUT /estudantes/1
router.put('/:id', validar(estudanteSchema), async (req, res) => {
  const atualizado = await estudanteService.atualizar(req.params.id, req.body);
  res.json(paraEstudanteDTO(atualizado));
});

// DELETE /estudantes/1
router.delete('/:id', async (req, res) => {
  await estudanteService.excluir(req.params.id);
  res.status(204).send();
});

export default router;
