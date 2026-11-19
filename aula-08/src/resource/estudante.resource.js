import { Router } from 'express';
import { estudanteService } from '../services/estudante.service.js';

const router = Router();

// A rota só traduz HTTP: lê a requisição, chama o serviço e devolve a resposta.
// Se o serviço lançar um erro (ex.: ObjectNotFoundError), o Express o recebe sozinho.
// Por enquanto ele responde com uma página de erro em HTML (a aula 11 padroniza em JSON).

// GET /estudantes
router.get('/', async (req, res) => {
  res.json(await estudanteService.buscarTodos());
});

// GET /estudantes/1
router.get('/:id', async (req, res) => {
  res.json(await estudanteService.buscarPorId(req.params.id));
});

// POST /estudantes
router.post('/', async (req, res) => {
  const novo = await estudanteService.salvar(req.body);
  res.status(201).json(novo);
});

// PUT /estudantes/1
router.put('/:id', async (req, res) => {
  res.json(await estudanteService.atualizar(req.params.id, req.body));
});

// DELETE /estudantes/1
router.delete('/:id', async (req, res) => {
  await estudanteService.excluir(req.params.id);
  res.status(204).send();
});

export default router;
