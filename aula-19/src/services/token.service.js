import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UnauthorizedError } from '../exceptions/unauthorized.error.js';

const ALGORITMO = 'HS256';

export const tokenService = {
  // O token é assinado (HS256) e carrega quem é o usuário e o que ele pode fazer
  gerarToken(username, autoridades) {
    const token = jwt.sign({ autoridades }, config.jwt.segredo, {
      algorithm: ALGORITMO,
      subject: username,
      issuer: 'api-escola',
      expiresIn: config.jwt.expiracaoEmSegundos,
    });
    return { token, tipo: 'Bearer', expiraEmSegundos: config.jwt.expiracaoEmSegundos };
  },

  // Confere a assinatura e a validade. Qualquer problema vira um 401.
  validar(token) {
    try {
      const dados = jwt.verify(token, config.jwt.segredo, { algorithms: [ALGORITMO], issuer: 'api-escola' });
      return { username: dados.sub, autoridades: dados.autoridades ?? [] };
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado');
    }
  },
};
