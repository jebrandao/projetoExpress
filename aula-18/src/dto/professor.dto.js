import { z } from 'zod';
import { textoObrigatorio } from './comum.js';

export const professorSchema = z.object({
  nome: textoObrigatorio('O nome'),
  especializacao: textoObrigatorio('A especialização'),
  telefone: textoObrigatorio('O telefone'),
});

export function paraProfessorDTO(professor) {
  return {
    matricula: professor.matricula,
    nome: professor.nome,
    especializacao: professor.especializacao,
    telefone: professor.telefone,
  };
}
