import { Router } from 'express';
import { Estudante } from '../models/index.js';

const router = Router();

// As operações com o banco são assíncronas: usamos async/await.
// No Express 5, um erro dentro de uma rota async é repassado automaticamente ao Express.

// GET /estudantes
router.get('/', async (req, res) => {
  const estudantes = await Estudante.findAll();
  res.json(estudantes);
});

// GET /estudantes/1
router.get('/:id', async (req, res) => {
  const estudante = await Estudante.findByPk(req.params.id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${req.params.id}` });
  }
  res.json(estudante);
});

// POST /estudantes
router.post('/', async (req, res) => {
  const novo = await Estudante.create(req.body);
  res.status(201).json(novo);
});

// PUT /estudantes/1
router.put('/:id', async (req, res) => {
  const estudante = await Estudante.findByPk(req.params.id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${req.params.id}` });
  }
  await estudante.update(req.body);
  res.json(estudante);
});

// DELETE /estudantes/1
router.delete('/:id', async (req, res) => {
  const estudante = await Estudante.findByPk(req.params.id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${req.params.id}` });
  }
  await estudante.destroy();
  res.status(204).send();
});

export default router;
