import { Router } from 'express';
import { usuarioService } from '../services/usuario.service.js';
import { usuarioCadastroSchema, paraUsuarioDTO } from '../dto/usuario.dto.js';
import { validar } from '../middleware/validar.js';

// Acesso restrito à permissão USUARIOS (a regra é aplicada no app.js)
const router = Router();

/**
 * @openapi
 * /usuarios:
 *   get:
 *     tags: [Usuários]
 *     summary: Lista os usuários e seus papéis
 *     responses:
 *       200: { description: Lista de usuários }
 *       403: { description: Falta a permissão USUARIOS }
 */
router.get('/', async (req, res) => {
  const usuarios = await usuarioService.buscarTodos();
  res.json(usuarios.map(paraUsuarioDTO));
});

/**
 * @openapi
 * /usuarios:
 *   post:
 *     tags: [Usuários]
 *     summary: Cadastra um usuário com os papéis informados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { username: secretaria, senha: senha-forte-1, papeis: [USER] }
 *     responses:
 *       201: { description: Usuário criado }
 *       400: { description: Dados inválidos, login já existente ou papel inexistente }
 *       403: { description: Falta a permissão USUARIOS }
 */
router.post('/', validar(usuarioCadastroSchema), async (req, res) => {
  const { username, senha, papeis } = req.body;
  const usuario = await usuarioService.criarUsuario(username, senha, papeis);
  res.status(201).json(paraUsuarioDTO(usuario));
});

export default router;
