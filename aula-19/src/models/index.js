import { sequelize } from '../config/database.js';
import { Endereco } from './endereco.model.js';
import { Estudante } from './estudante.model.js';
import { Professor } from './professor.model.js';
import { Turma } from './turma.model.js';
import { Papel } from './papel.model.js';
import { Permissao } from './permissao.model.js';
import { Usuario } from './usuario.model.js';

// ---------------------------------------------------------------------------
// RELACIONAMENTOS (cardinalidade)
// Sempre declaramos os dois lados: assim dá para navegar nos dois sentidos.
// ---------------------------------------------------------------------------

// 1:1 - um estudante possui um endereço.
// O Estudante guarda a chave estrangeira (coluna enderecoId): ele é o "dono" da relação.
Estudante.belongsTo(Endereco, { as: 'endereco', foreignKey: 'enderecoId' });
Endereco.hasOne(Estudante, { as: 'estudante', foreignKey: 'enderecoId' });

// 1:N e N:1 - um professor leciona várias turmas; cada turma tem um professor.
// A Turma guarda a chave estrangeira (professorMatricula).
// RESTRICT: não deixa apagar um professor que ainda tem turmas.
Professor.hasMany(Turma, {
  as: 'turmas',
  foreignKey: 'professorMatricula',
  onDelete: 'RESTRICT',
});
Turma.belongsTo(Professor, { as: 'professor', foreignKey: 'professorMatricula' });

// N:N - uma turma tem vários estudantes e um estudante está em várias turmas.
// O banco precisa de uma tabela de ligação (turma_estudante) com as chaves dos dois lados.
Turma.belongsToMany(Estudante, {
  as: 'estudantes',
  through: 'turma_estudante',
  foreignKey: 'turmaId',
  otherKey: 'estudanteId',
  timestamps: false,
});
Estudante.belongsToMany(Turma, {
  as: 'turmas',
  through: 'turma_estudante',
  foreignKey: 'estudanteId',
  otherKey: 'turmaId',
  timestamps: false,
});

// N:N - um usuário pode ter vários papéis, e um papel agrupa várias permissões.
Usuario.belongsToMany(Papel, {
  as: 'papeis',
  through: 'usuario_papel',
  foreignKey: 'usuarioId',
  otherKey: 'papelId',
  timestamps: false,
});
Papel.belongsToMany(Usuario, {
  as: 'usuarios',
  through: 'usuario_papel',
  foreignKey: 'papelId',
  otherKey: 'usuarioId',
  timestamps: false,
});
Papel.belongsToMany(Permissao, {
  as: 'permissoes',
  through: 'papel_permissao',
  foreignKey: 'papelId',
  otherKey: 'permissaoId',
  timestamps: false,
});
Permissao.belongsToMany(Papel, {
  as: 'papeis',
  through: 'papel_permissao',
  foreignKey: 'permissaoId',
  otherKey: 'papelId',
  timestamps: false,
});

// Ponto único de importação dos models
export { sequelize, Endereco, Estudante, Papel, Permissao, Professor, Turma, Usuario };
