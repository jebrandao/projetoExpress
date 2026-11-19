import { z } from 'zod';
import { textoObrigatorio } from './comum.js';

export const enderecoSchema = z.object({
  logradouro: textoObrigatorio('O logradouro'),
  numero: z.string().trim().optional(),
  cep: textoObrigatorio('O CEP'),
  cidade: textoObrigatorio('A cidade'),
});

export function paraEnderecoDTO(endereco) {
  if (!endereco) return null;
  return {
    id: endereco.id,
    logradouro: endereco.logradouro,
    numero: endereco.numero,
    cep: endereco.cep,
    cidade: endereco.cidade,
  };
}
