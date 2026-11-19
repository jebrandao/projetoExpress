# API Escola com Node.js e Express

API REST de gestão escolar (estudantes, professores, turmas e usuários), construída passo a passo em **Node.js 24 + Express 5**.
É a versão em JavaScript do curso de Spring Boot: as mesmas camadas, as mesmas regras e o mesmo roteiro, usando as ferramentas do ecossistema Node.

## O que o projeto cobre

- Arquitetura em camadas: **resource** (rotas) → **service** → **repository** → **model**
- Persistência com **Sequelize** (SQLite em desenvolvimento, MySQL em produção) e **migrações** com Umzug
- **DTO e validação** com Zod, mapeamento explícito da entidade para a resposta
- Documentação **OpenAPI/Swagger** em `/api-docs`
- Tratamento padronizado de erros em JSON (400, 401, 403, 404, 409 e 500)
- Perfis de execução (`development`, `test`, `production`) por variáveis de ambiente
- Relacionamentos 1:1, 1:N e N:N, consultas dinâmicas, transações, bloqueio otimista, exclusão lógica e auditoria
- Segurança: senhas com **bcrypt**, **JWT**, papéis e permissões, **CORS**
- **Testes automatizados** (`node:test` + `supertest`): 103 testes no projeto final

## Como o repositório está organizado

Cada pasta `aula-NN` é o projeto **completo, executável**, no estado em que ele termina na aula NN. A pasta `aula-19` é o projeto final.
Quem faltou a uma aula parte da pasta da aula anterior ou simplesmente confere o resultado na pasta da aula.

| Pasta | Aula | Conteúdo |
|---|---|---|
| `aula-03` | EX03 | Node.js, npm, primeiro servidor Express |
| `aula-04` | EX04 | Arquivos de configuração e perfis (`.env.<perfil>`) |
| `aula-05` | EX05 | Rotas, `Router` e middlewares (CRUD em memória) |
| `aula-06` | EX06 | Models com Sequelize e banco SQLite |
| `aula-07` | EX07 | Camada Repository |
| `aula-08` | EX08 | Camada Service e erro 404 |
| `aula-09` | EX09 | DTO e validação com Zod |
| `aula-10` | EX10 | Professores e turmas, Swagger e paginação |
| `aula-11` | EX11 | Tratamento de erros |
| `aula-12` | EX12 | Dados iniciais (`SEED`) |
| `aula-13` | EX13 | Banco em arquivo, MySQL e perfis |
| `aula-14` | EX14 | Relacionamentos (cardinalidade) |
| `aula-15` | EX15 | Segurança com HTTP Basic e bcrypt |
| `aula-16` | EX16 | Testes automatizados |
| `aula-17` | EX17 | Migrações |
| `aula-18` | EX18 | Consultas, transações, versão, exclusão lógica e auditoria |
| `aula-19` | EX19 | JWT, papéis, permissões e CORS |

As aulas 1 e 2 (API, REST e métodos HTTP) são só conceituais e não têm código.

## Material de apoio

A pasta `Material/` traz os slides (`TI EXnn - ....pptx`) no mesmo design do curso de Spring Boot, com **passo a passo** para o aluno seguir sozinho.
As aulas 14, 18 e 19 passariam de 60 slides com o código completo; por isso mostram só o código novo e as alterações. As aulas 14, 16, 18 e 19 têm um documento `TI EXnn.1 - Código Completo.docx` com o código inteiro de todos os arquivos novos e alterados (na aula 16 ele traz, por exemplo, os testes repetitivos que não cabem nos slides).

## Como executar

Pré-requisito: **Node.js 22 ou superior** (testado com a 24).

```powershell
cd aula-19
npm install
npm run dev
```

A API sobe em `http://localhost:3000` e a documentação em `http://localhost:3000/api-docs`.

Antes da primeira execução em modo `development` (a partir da aula 13), crie a pasta do banco: `mkdir dados`.

Faça login para obter um token (usuários de exemplo: `admin` / `admin123` e `aluno` / `aluno123`):

```powershell
curl.exe -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"senha\":\"admin123\"}"
```

Use o token nas demais chamadas: `-H "Authorization: Bearer <token>"`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a API reiniciando a cada alteração (`node --watch`) |
| `npm start` | Sobe a API normalmente |
| `npm run start:prod` | Sobe com o perfil `production` (copie `.env.production.example` para `.env.production`) |
| `npm test` | Executa todos os testes (perfil `test`, banco em memória) |
| `npm run migrar` / `migrar:status` / `migrar:desfazer` | Gerencia as migrações (aula 17 em diante) |
| `npm run bd -- "SELECT ..."` | Executa uma consulta SQL no banco do perfil ativo (aula 13 em diante) |

## Equivalência com o curso de Spring Boot

| Spring Boot | Node.js + Express |
|---|---|
| Maven / `pom.xml` | npm / `package.json` |
| `application-dev.properties` | `.env.development` + `src/config/env.js` |
| `@Entity` | `sequelize.define(...)` |
| `JpaRepository` | `criarRepositorio(Modelo)` |
| `@Service` | objeto `xxxService` |
| `@RestController` | `Router()` do Express |
| `@Valid` + Bean Validation | schemas do Zod + middleware `validar` |
| `@ControllerAdvice` | middleware de erros (4 parâmetros) |
| springdoc / Swagger | swagger-jsdoc + swagger-ui-express |
| Flyway | Umzug |
| Spring Security + JWT | middleware `autenticar` + `jsonwebtoken` |
| JUnit + Mockito + MockMvc | `node:test` + `mock` + supertest |

## Autor

Jefferson Brandão
