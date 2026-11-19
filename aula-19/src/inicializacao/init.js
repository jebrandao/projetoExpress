import { estudanteService } from '../services/estudante.service.js';
import { professorService } from '../services/professor.service.js';
import { turmaService } from '../services/turma.service.js';
import { usuarioService } from '../services/usuario.service.js';

// Endereço de exemplo usado pelos estudantes
const enderecoPadrao = {
  logradouro: 'Rua das Flores',
  numero: '100',
  cep: '20000-000',
  cidade: 'Rio de Janeiro',
};

// Usuários de teste (apenas didático: em produção use senhas fortes vindas de variáveis de ambiente)
async function criarUsuarios() {
  if (!(await usuarioService.existe('admin'))) {
    await usuarioService.criarUsuario('admin', 'admin123', ['ADMIN']);
  }
  if (!(await usuarioService.existe('aluno'))) {
    await usuarioService.criarUsuario('aluno', 'aluno123', ['USER']);
  }
}

// Carrega alguns dados de exemplo quando a aplicação inicia.
export async function iniciarDados() {
  await criarUsuarios();

  // Evita duplicar os dados a cada reinício (importante quando o banco fica em arquivo)
  const existentes = await estudanteService.buscarTodos();
  if (existentes.length > 0) {
    return;
  }

  // ---------- Estudantes (cada um com seu endereço)
  const alberto = await estudanteService.salvar({
    nome: 'Alberto',
    sobreNome: 'Peixoto',
    email: 'albertop@email.com.br',
    dataNascimento: '1999-11-05',
    endereco: enderecoPadrao,
  });
  const cremilda = await estudanteService.salvar({
    nome: 'Cremilda',
    sobreNome: 'Viana',
    email: 'cviana@email.com.br',
    dataNascimento: '1975-09-04',
    endereco: enderecoPadrao,
  });
  const bernardo = await estudanteService.salvar({
    nome: 'Bernardo',
    sobreNome: 'Silva',
    email: 'bsilva@email.com.br',
    dataNascimento: '2005-06-14',
    endereco: enderecoPadrao,
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
  const marta = await professorService.salvar({
    nome: 'Marta Oliveira Santos',
    especializacao: 'Banco de Dados',
    telefone: '(21) 99999-0000',
  });
  const paulo = await professorService.salvar({
    nome: 'Paulo Ricardo Lima',
    especializacao: 'Programação JavaScript',
    telefone: '(21) 98888-1111',
  });

  // ---------- Turmas (N:1 com professor e N:N com estudantes)
  const turma1 = await turmaService.salvar({
    numero: '20240007',
    titulo: 'Desenvolvimento de Sistemas',
    turno: 'NOITE',
    professorMatricula: marta.matricula,
  });
  const turma2 = await turmaService.salvar({
    numero: '20240008',
    titulo: 'Análise de Dados',
    turno: 'MANHA',
    professorMatricula: paulo.matricula,
  });

  await turmaService.matricularEstudante(turma1.id, alberto.id);
  await turmaService.matricularEstudante(turma1.id, cremilda.id);
  await turmaService.matricularEstudante(turma2.id, cremilda.id);

  console.log('Dados iniciais carregados.');
}
