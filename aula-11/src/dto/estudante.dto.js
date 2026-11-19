import { z } from 'zod';
import { textoObrigatorio } from './comum.js';

// DTO (Data Transfer Object): o formato dos dados que ENTRAM e SAEM da API.
// O schema do Zod descreve e valida o JSON recebido.
export const estudanteSchema = z.object({
  nome: textoObrigatorio('O nome'),
  sobreNome: z.string().trim().optional(),
  email: z.email({
    error: (problema) =>
      problema.input === undefined ? 'O e-mail é obrigatório' : 'E-mail inválido',
  }),
  dataNascimento: z.iso
    .date({ error: 'Data inválida (use o formato AAAA-MM-DD)' })
    .refine((data) => data < new Date().toISOString().slice(0, 10), {
      message: 'A data de nascimento deve estar no passado',
    })
    .optional(),
});

// Mapeamento entidade -> DTO: escolhe, de forma explícita, o que será exposto.
// Campos internos nunca vazam por acidente.
export function paraEstudanteDTO(estudante) {
  return {
    id: estudante.id,
    nome: estudante.nome,
    sobreNome: estudante.sobreNome,
    email: estudante.email,
    dataNascimento: estudante.dataNascimento,
  };
}
