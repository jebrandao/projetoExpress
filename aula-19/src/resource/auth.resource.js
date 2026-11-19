import { Router } from 'express';
import { usuarioService } from '../services/usuario.service.js';
import { tokenService } from '../services/token.service.js';
import { UnauthorizedError } from '../exceptions/unauthorized.error.js';
import { loginSchema, registroSchema, paraUsuarioDTO } from '../dto/usuario.dto.js';
import { validar } from '../middleware/validar.js';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Autentica e devolve um token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { username: admin, senha: admin123 }
 *     responses:
 *       200: { description: Token gerado }
 *       401: { description: Usuário ou senha inválidos }
 */
router.post('/login', validar(loginSchema), async (req, res) => {
  const usuario = await usuarioService.autenticar(req.body.username, req.body.senha);

  // Mensagem genérica de propósito: não revela se o usuário existe ou se foi a senha que estava errada
  if (!usuario) {
    throw new UnauthorizedError();
  }

  const autoridades = usuarioService.autoridadesDe(usuario);
  res.json(tokenService.gerarToken(usuario.username, autoridades));
});

/**
 * @openapi
 * /auth/registrar:
 *   post:
 *     tags: [Autenticação]
 *     summary: Auto-cadastro, cria um usuário com o papel USER
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { username: visitante, senha: senha-forte-2 }
 *     responses:
 *       201: { description: Usuário criado }
 *       400: { description: Dados inválidos ou login já existente }
 */
router.post('/registrar', validar(registroSchema), async (req, res) => {
  const usuario = await usuarioService.criarUsuario(req.body.username, req.body.senha, ['USER']);
  res.status(201).json(paraUsuarioDTO(usuario));
});

export default router;
