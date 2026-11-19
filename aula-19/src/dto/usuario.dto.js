import { z } from 'zod';
import { textoObrigatorio } from './comum.js';

const username = z
  .string({ error: 'O login é obrigatório' })
  .trim()
  .min(3, 'O login deve ter de 3 a 50 caracteres')
  .max(50, 'O login deve ter de 3 a 50 caracteres');

// A senha tem tamanho mínimo (8) e máximo (72, o limite do bcrypt)
const senhaNova = z
  .string({ error: 'A senha é obrigatória' })
  .min(8, 'A senha deve ter de 8 a 72 caracteres')
  .max(72, 'A senha deve ter de 8 a 72 caracteres');

export const loginSchema = z.object({
  username: textoObrigatorio('O login'),
  senha: z.string({ error: 'A senha é obrigatória' }).min(1, 'A senha é obrigatória'),
});

// Auto-cadastro: a pessoa informa só login e senha (o papel é sempre USER)
export const registroSchema = z.object({ username, senha: senhaNova });

// Cadastro feito por um administrador: ele escolhe os papéis
export const usuarioCadastroSchema = z.object({
  username,
  senha: senhaNova,
  papeis: z.array(z.string()).min(1, 'Informe pelo menos um papel'),
});

// Resposta: nunca devolve a senha (nem o hash)
export function paraUsuarioDTO(usuario) {
  return {
    id: usuario.id,
    username: usuario.username,
    papeis: usuario.papeis.map((papel) => papel.nome),
  };
}
