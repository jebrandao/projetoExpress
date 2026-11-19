import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estudanteSchema, paraEstudanteDTO } from '../../src/dto/estudante.dto.js';
import { turmaSchema } from '../../src/dto/turma.dto.js';
import { professorSchema } from '../../src/dto/professor.dto.js';

// Teste de validação sem servidor nem banco: só os schemas do Zod
describe('DTOs e validação (unitário)', () => {
  const estudanteValido = { nome: 'Ana', email: 'ana@email.com', dataNascimento: '2000-01-10' };

  // Devolve os nomes dos campos que falharam
  const camposComErro = (resultado) => resultado.error.issues.map((p) => p.path.join('.'));

  it('aceita um estudante válido', () => {
    assert.equal(estudanteSchema.safeParse(estudanteValido).success, true);
  });

  it('recusa nome em branco', () => {
    const resultado = estudanteSchema.safeParse({ ...estudanteValido, nome: '   ' });
    assert.deepEqual(camposComErro(resultado), ['nome']);
  });

  it('recusa e-mail mal formado', () => {
    const resultado = estudanteSchema.safeParse({ ...estudanteValido, email: 'nao-e-email' });
    assert.deepEqual(camposComErro(resultado), ['email']);
  });

  it('recusa data de nascimento no futuro', () => {
    const resultado = estudanteSchema.safeParse({ ...estudanteValido, dataNascimento: '2999-01-01' });
    assert.deepEqual(camposComErro(resultado), ['dataNascimento']);
  });

  it('descarta campos desconhecidos, como o id enviado pelo cliente', () => {
    const resultado = estudanteSchema.parse({ ...estudanteValido, id: 99, admin: true });
    assert.equal('id' in resultado, false);
    assert.equal('admin' in resultado, false);
  });

  it('valida os campos do endereço aninhado', () => {
    const resultado = estudanteSchema.safeParse({
      ...estudanteValido,
      endereco: { logradouro: '', cep: '2000', cidade: 'Rio' },
    });
    assert.deepEqual(camposComErro(resultado), ['endereco.logradouro']);
  });

  it('turma: o número precisa ter 8 dígitos e o turno ser válido', () => {
    const resultado = turmaSchema.safeParse({ numero: '12', titulo: 'DS', turno: 'MADRUGADA' });
    assert.deepEqual(camposComErro(resultado).sort(), ['numero', 'turno']);
  });

  it('professor: todos os campos são obrigatórios', () => {
    const resultado = professorSchema.safeParse({});
    assert.equal(camposComErro(resultado).length, 3);
  });

  it('o mapeamento para DTO expõe apenas os campos escolhidos', () => {
    const entidade = { id: 1, nome: 'Ana', email: 'ana@email.com', campoInterno: 'segredo' };
    const dto = paraEstudanteDTO(entidade);
    assert.equal(dto.nome, 'Ana');
    assert.equal('campoInterno' in dto, false);
  });
});
