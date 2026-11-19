import { contextoDaRequisicao } from '../models/auditoria.js';

// Guarda o usuário logado no contexto da requisição.
// Assim os hooks de auditoria sabem "quem" está gravando, sem receber o usuário como parâmetro.
// Deve rodar DEPOIS do middleware de autenticação.
export function registrarUsuarioNoContexto(req, res, next) {
  contextoDaRequisicao.run({ usuario: req.usuario?.username }, next);
}
