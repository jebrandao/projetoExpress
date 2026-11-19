import { estudanteService } from '../services/estudante.service.js';
import { professorService } from '../services/professor.service.js';
import { turmaService } from '../services/turma.service.js';

// Carrega alguns dados de exemplo quando a aplicação inicia.
export async function iniciarDados() {
  // Evita duplicar os dados a cada reinício (importante quando o banco fica em arquivo)
  const existentes = await estudanteService.buscarTodos();
  if (existentes.length > 0) {
    return;
  }

  // ---------- Estudantes
  const alberto = await estudanteService.salvar({
    nome: 'Alberto',
    sobreNome: 'Peixoto',
    email: 'albertop@email.com.br',
    dataNascimento: '1999-11-05',
  });
  await estudanteService.salvar({
    nome: 'Cremilda',
    sobreNome: 'Viana',
    email: 'cviana@email.com.br',
    dataNascimento: '1975-09-04',
  });
  const bernardo = await estudanteService.salvar({
    nome: 'Bernardo',
    sobreNome: 'Silva',
    email: 'bsilva@email.com.br',
    dataNascimento: '2005-06-14',
  });

  // buscar todos os estudantes
  const lista = await estudanteService.buscarTodos();
  lista.forEach((estudante) => console.log(estudante.nome));

  // buscar um estudante pelo id
  const encontrado = await estudanteService.buscarPorId(alberto.id);
  console.log(encontrado.nome);

  // alterar estudante
  const alterado = await estudanteService.atualizar(bernardo.id, {
    nome: 'Bernardo',
    sobreNome: 'Silva e Santos',
    email: 'bss@email.com.br',
    dataNascimento: '2005-06-14',
  });
  console.log(alterado.email);

  // ---------- Professores
  await professorService.salvar({
    nome: 'Marta Oliveira Santos',
    especializacao: 'Banco de Dados',
    telefone: '(21) 99999-0000',
  });
  await professorService.salvar({
    nome: 'Paulo Ricardo Lima',
    especializacao: 'Programação JavaScript',
    telefone: '(21) 98888-1111',
  });

  // ---------- Turmas
  await turmaService.salvar({ numero: '20240007', titulo: 'Desenvolvimento de Sistemas', turno: 'NOITE' });
  await turmaService.salvar({ numero: '20240008', titulo: 'Análise de Dados', turno: 'MANHA' });

  console.log('Dados iniciais carregados.');
}
