import { Router } from 'express';

// Por enquanto os dados ficam em uma lista na memória.
// Nas próximas aulas eles passam para um banco de dados.
let estudantes = [
  { id: 1, nome: 'Alberto', sobreNome: 'Peixoto', email: 'albertop@email.com.br', dataNascimento: '1999-11-05' },
  { id: 2, nome: 'Cremilda', sobreNome: 'Viana', email: 'cviana@email.com.br', dataNascimento: '1975-09-04' },
];
let proximoId = 3;

const router = Router();

// GET /estudantes
router.get('/', (req, res) => {
  res.json(estudantes);
});

// GET /estudantes/1  (":id" é um parâmetro de rota)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const estudante = estudantes.find((e) => e.id === id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${id}` });
  }
  res.json(estudante);
});

// POST /estudantes  (o corpo da requisição chega em req.body)
router.post('/', (req, res) => {
  const { nome, sobreNome, email, dataNascimento } = req.body;
  const novo = { id: proximoId++, nome, sobreNome, email, dataNascimento };

  estudantes.push(novo);
  res.status(201).json(novo);
});

// PUT /estudantes/1
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const estudante = estudantes.find((e) => e.id === id);

  if (!estudante) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${id}` });
  }

  const { nome, sobreNome, email, dataNascimento } = req.body;
  Object.assign(estudante, { nome, sobreNome, email, dataNascimento });
  res.json(estudante);
});

// DELETE /estudantes/1
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existe = estudantes.some((e) => e.id === id);

  if (!existe) {
    return res.status(404).json({ message: `Estudante não encontrado: id ${id}` });
  }

  estudantes = estudantes.filter((e) => e.id !== id);
  res.status(204).send();
});

export default router;
