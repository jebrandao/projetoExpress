// V3: dois estudantes não podem ter o mesmo e-mail
export async function up({ context: queryInterface }) {
  await queryInterface.addIndex('estudante', ['email'], {
    unique: true,
    name: 'uk_estudante_email',
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeIndex('estudante', 'uk_estudante_email');
}
