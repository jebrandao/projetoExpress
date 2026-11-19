import swaggerJsdoc from 'swagger-jsdoc';
import { exemplos } from '../commons/exemplos.js';

// A documentação OpenAPI é montada a partir dos comentários "@openapi" das rotas
// (pasta src/resource) mais as definições comuns abaixo.
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Escola',
      version: '1.0',
      description: 'API de gestão escolar - curso Node.js e Express',
    },
    // Faz o botão "Authorize" do Swagger UI aceitar o token JWT (Bearer)
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      parameters: {
        id: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'Identificador do registro',
        },
      },
      schemas: {
        Estudante: { type: 'object', example: exemplos.estudante },
        Professor: { type: 'object', example: exemplos.professor },
        Turma: { type: 'object', example: exemplos.turma },
      },
    },
  },
  apis: ['./src/resource/*.js'], // arquivos com comentários @openapi
});
