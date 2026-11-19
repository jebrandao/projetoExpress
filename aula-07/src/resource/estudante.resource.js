import { Router } from 'express';
import { estudanteRepository } from '../repositories/estudante.repository.js';

const router = Router();

// Agora a rota não conhece o Sequelize: ela conversa só com o repositório.

// GET /estudantes
router.get('/', async (req, res) => {
  const estudantes = await estudanteRepository.buscarTodos();
  res.json(estudantes);
});

// GET /estudantes/1
router.get('/:id', async (req, res) => {
  const estudante = await estudanteRepository.buscarPorId(req.params.id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${req.params.id}` });
  }
  res.json(estudante);
});

// POST /estudantes
router.post('/', async (req, res) => {
  const novo = await estudanteRepository.salvar(req.body);
  res.status(201).json(novo);
});

// PUT /estudantes/1
router.put('/:id', async (req, res) => {
  const estudante = await estudanteRepository.buscarPorId(req.params.id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${req.params.id}` });
  }
  await estudanteRepository.atualizar(estudante, req.body);
  res.json(estudante);
});

// DELETE /estudantes/1
router.delete('/:id', async (req, res) => {
  const estudante = await estudanteRepository.buscarPorId(req.params.id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${req.params.id}` });
  }
  await estudanteRepository.remover(estudante);
  res.status(204).send();
});

export default router;
