/**
 * Servidor HTTP
 * Inicialização do serviço na porta configurada
 */

import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Pagamentus API] Servidor iniciado na porta ${PORT}`);
  console.log(`[Pagamentus API] Módulo IRPF (SPEC-3.14) ativo.`);
});
