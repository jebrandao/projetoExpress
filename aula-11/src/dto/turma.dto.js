import { z } from 'zod';
import { textoObrigatorio } from './comum.js';

export const turmaSchema = z.object({
  // Formato AAAANNNN (8 dígitos). Exemplo: 20240007
  numero: z
    .string({ error: 'O número é obrigatório' })
    .regex(/^\d{8}$/, 'O número deve ter 8 dígitos (AAAANNNN)'),
  titulo: textoObrigatorio('O título'),
  turno: z.enum(['MANHA', 'TARDE', 'NOITE'], {
    error: 'O turno deve ser MANHA, TARDE ou NOITE',
  }),
});

export function paraTurmaDTO(turma) {
  return {
    id: turma.id,
    numero: turma.numero,
    titulo: turma.titulo,
    turno: turma.turno,
  };
}
