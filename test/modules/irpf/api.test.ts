/**
 * Testes de Integração da API HTTP - SPEC-3.14 (Rendimentos e deduções)
 * Validação dos endpoints REST definidos no plano técnico
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'node:http';
import { createApp } from '../../../src/app';
import { IrpfService } from '../../../src/modules/irpf/service';
import { InMemoryIrpfRepository } from '../../../src/modules/irpf/repository';
import {
  TipoRendimento,
  CategoriaDeducao,
} from '../../../src/modules/irpf/types';

describe('API REST: Módulo IRPF (SPEC-3.14)', () => {
  let server: Server;
  let baseUrl: string;
  const contribuinteId = '22222222-2222-2222-2222-222222222222';

  before(async () => {
    const repository = new InMemoryIrpfRepository();
    const service = new IrpfService(repository);
    const app = createApp(service);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          baseUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('Endpoints de Rendimentos (RF-031, CA-1, CA-3, CA-4)', () => {
    let rendimentoCriadoId: string;

    it('POST /api/irpf/:contribuinteId/rendimentos - deve cadastrar rendimento com sucesso (HTTP 201)', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/rendimentos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exercicio: 2025,
            tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
            fontePagadoraDocumento: '12.345.678/0001-99',
            fontePagadoraNome: 'Empresa Tecnologia Ltda',
            valorRendimento: 8000.0,
            impostoRetidoFonte: 1200.0,
            previdenciaOficial: 800.0,
          }),
        }
      );

      assert.equal(response.status, 201);
      const json: any = await response.json();
      assert.equal(json.sucesso, true);
      assert.ok(json.dados.id);
      assert.equal(json.dados.exercicio, 2025);
      assert.equal(json.dados.tipoRendimento, TipoRendimento.TRIBUTAVEL_PJ);
      rendimentoCriadoId = json.dados.id;
    });

    it('POST /api/irpf/:contribuinteId/rendimentos - deve retornar HTTP 400 em caso de valor negativo (CA-4)', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/rendimentos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exercicio: 2025,
            tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
            fontePagadoraDocumento: '12.345.678/0001-99',
            fontePagadoraNome: 'Empresa Teste',
            valorRendimento: -500.0,
          }),
        }
      );

      assert.equal(response.status, 400);
      const json: any = await response.json();
      assert.equal(json.sucesso, false);
      assert.ok(json.erros.length > 0);
    });

    it('GET /api/irpf/:contribuinteId/rendimentos?exercicio=2025 - deve listar rendimentos agrupados por tipo (CA-1, CA-3)', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/rendimentos?exercicio=2025`
      );

      assert.equal(response.status, 200);
      const json: any = await response.json();
      assert.equal(json.sucesso, true);
      assert.equal(json.dados.exercicio, 2025);
      assert.equal(json.dados.rendimentos.length, 1);
      assert.equal(json.dados.subtotaisPorTipo[TipoRendimento.TRIBUTAVEL_PJ], 8000.0);
    });

    it('DELETE /api/irpf/:contribuinteId/rendimentos/:id - deve excluir rendimento com sucesso', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/rendimentos/${rendimentoCriadoId}`,
        { method: 'DELETE' }
      );

      assert.equal(response.status, 200);
      const json: any = await response.json();
      assert.equal(json.sucesso, true);
    });
  });

  describe('Endpoints de Pagamentos e Deduções (RF-033, CA-2, CA-3, CA-4)', () => {
    let pagamentoCriadoId: string;

    it('POST /api/irpf/:contribuinteId/pagamentos - deve cadastrar despesa dedutível com sucesso (HTTP 201)', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/pagamentos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exercicio: 2025,
            categoriaDeducao: CategoriaDeducao.MEDICA,
            favorecidoDocumento: '98.765.432/0001-11',
            favorecidoNome: 'Hospital Santa Maria',
            valorPago: 1800.0,
            parcelaNaoDedutivelReembolso: 300.0,
          }),
        }
      );

      assert.equal(response.status, 201);
      const json: any = await response.json();
      assert.equal(json.sucesso, true);
      assert.ok(json.dados.id);
      assert.equal(json.dados.categoriaDeducao, CategoriaDeducao.MEDICA);
      pagamentoCriadoId = json.dados.id;
    });

    it('POST /api/irpf/:contribuinteId/pagamentos - deve rejeitar requisição sem favorecido (CA-4)', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/pagamentos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exercicio: 2025,
            categoriaDeducao: CategoriaDeducao.MEDICA,
            favorecidoDocumento: '',
            favorecidoNome: '',
            valorPago: 1000.0,
          }),
        }
      );

      assert.equal(response.status, 400);
      const json: any = await response.json();
      assert.equal(json.sucesso, false);
    });

    it('GET /api/irpf/:contribuinteId/pagamentos?exercicio=2025 - deve listar pagamentos agrupados por categoria (CA-2, CA-3)', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/pagamentos?exercicio=2025`
      );

      assert.equal(response.status, 200);
      const json: any = await response.json();
      assert.equal(json.sucesso, true);
      assert.equal(json.dados.exercicio, 2025);
      assert.equal(json.dados.pagamentos.length, 1);
      assert.equal(json.dados.subtotaisPorCategoria[CategoriaDeducao.MEDICA], 1800.0);
      assert.equal(json.dados.totalDedutivelEstimado, 1500.0);
    });

    it('DELETE /api/irpf/:contribuinteId/pagamentos/:id - deve excluir despesa dedutível com sucesso', async () => {
      const response = await fetch(
        `${baseUrl}/api/irpf/${contribuinteId}/pagamentos/${pagamentoCriadoId}`,
        { method: 'DELETE' }
      );

      assert.equal(response.status, 200);
      const json: any = await response.json();
      assert.equal(json.sucesso, true);
    });
  });
});
