/**
 * Módulo IRPF - Rotas da API
 * Especificação: SPEC-3.14 (RF-031, RF-033, CA-1, CA-2, CA-3)
 */

import { Router } from 'express';
import { IrpfController } from './controller';
import { IrpfService } from './service';
import { InMemoryIrpfRepository } from './repository';

export function createIrpfRouter(service?: IrpfService): Router {
  const router = Router();
  const irpfService = service || new IrpfService(new InMemoryIrpfRepository());
  const controller = new IrpfController(irpfService);

  // Rotas de Rendimentos (RF-031, CA-1, CA-3, CA-4, CA-5)
  router.post('/api/irpf/:contribuinteId/rendimentos', (req, res) =>
    controller.criarRendimento(req, res)
  );
  router.get('/api/irpf/:contribuinteId/rendimentos', (req, res) =>
    controller.listarRendimentos(req, res)
  );
  router.delete('/api/irpf/:contribuinteId/rendimentos/:id', (req, res) =>
    controller.excluirRendimento(req, res)
  );

  // Rotas de Pagamentos e Deduções (RF-033, CA-2, CA-3, CA-4, CA-5)
  router.post('/api/irpf/:contribuinteId/pagamentos', (req, res) =>
    controller.criarPagamentoDeducao(req, res)
  );
  router.get('/api/irpf/:contribuinteId/pagamentos', (req, res) =>
    controller.listarPagamentos(req, res)
  );
  router.delete('/api/irpf/:contribuinteId/pagamentos/:id', (req, res) =>
    controller.excluirPagamento(req, res)
  );

  return router;
}
