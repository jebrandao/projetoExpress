import { z } from 'zod';

// Texto obrigatório: não pode faltar, nem ser vazio, nem ter só espaços
export function textoObrigatorio(rotulo) {
  return z
    .string({ error: `${rotulo} é obrigatório` })
    .trim()
    .min(1, `${rotulo} é obrigatório`);
}
