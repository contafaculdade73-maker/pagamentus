/**
 * Aplicação Principal (Express)
 * Configurações de middlewares e injeção de rotas do sistema
 */

import express, { Application } from 'express';
import { createIrpfRouter } from './modules/irpf/routes';
import { IrpfService } from './modules/irpf/service';
import { InMemoryIrpfRepository } from './modules/irpf/repository';

export function createApp(service?: IrpfService): Application {
  const app = express();

  // Middlewares essenciais
  app.use(express.json());

  // Rota de verificação de integridade (Health Check)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Rotas do Módulo IRPF (SPEC-3.14)
  const irpfRouter = createIrpfRouter(service);
  app.use(irpfRouter);

  return app;
}

export const defaultRepository = new InMemoryIrpfRepository();
export const defaultService = new IrpfService(defaultRepository);
export const app = createApp(defaultService);
