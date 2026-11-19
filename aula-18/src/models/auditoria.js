import { AsyncLocalStorage } from 'node:async_hooks';
import { DataTypes } from 'sequelize';

// ---------------------------------------------------------------------------
// AUDITORIA: quem e quando criou/alterou cada registro
// ---------------------------------------------------------------------------

// O AsyncLocalStorage guarda dados "da requisição atual" sem precisar passá-los
// de função em função: qualquer código executado durante a requisição os enxerga.
export const contextoDaRequisicao = new AsyncLocalStorage();

// Nome do usuário logado na requisição atual ("sistema" fora de uma requisição, como na carga inicial)
export function usuarioAtual() {
  return contextoDaRequisicao.getStore()?.usuario ?? 'sistema';
}

// Colunas de auditoria (somem do código dos models com o "spread" ...camposDeAuditoria)
export const camposDeAuditoria = {
  criadoPor: DataTypes.STRING,
  atualizadoPor: DataTypes.STRING,
};

// O Sequelize preenche as datas sozinho (timestamps); aqui só trocamos os nomes das colunas
export const opcoesDeAuditoria = {
  timestamps: true,
  createdAt: 'criadoEm',
  updatedAt: 'atualizadoEm',
};

// Hooks: funções executadas automaticamente antes de gravar. Preenchem "quem" fez a alteração.
export function aplicarAuditoria(Modelo) {
  Modelo.addHook('beforeCreate', (instancia) => {
    instancia.criadoPor = usuarioAtual();
    instancia.atualizadoPor = usuarioAtual();
  });
  Modelo.addHook('beforeUpdate', (instancia) => {
    instancia.atualizadoPor = usuarioAtual();
  });
}
