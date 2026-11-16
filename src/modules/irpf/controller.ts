/**
 * Módulo IRPF - Controlador REST
 * Especificação: SPEC-3.14 (CA-1, CA-2, CA-3, CA-4, CA-5)
 */

import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { IrpfService } from './service';

export class IrpfController {
  constructor(private readonly service: IrpfService) {}

  /**
   * Extrai um parâmetro de rota como string única
   */
  private extrairParametro(param: string | string[] | undefined): string {
    if (Array.isArray(param)) return param[0] || '';
    return param || '';
  }

  /**
   * POST /api/irpf/:contribuinteId/rendimentos
   * Registra rendimento por tipo e exercício (CA-1, CA-4, CA-5)
   */
  async criarRendimento(req: Request, res: Response): Promise<void> {
    try {
      const contribuinteId = this.extrairParametro(req.params.contribuinteId);
      const rendimento = await this.service.registrarRendimento(
        contribuinteId,
        req.body
      );
      res.status(201).json({
        sucesso: true,
        mensagem: 'Rendimento registrado com sucesso.',
        dados: rendimento,
      });
    } catch (erro: any) {
      this.tratarErro(erro, res);
    }
  }

  /**
   * GET /api/irpf/:contribuinteId/rendimentos?exercicio=YYYY
   * Consulta rendimentos por exercício e tipo com subtotais (CA-1, CA-3)
   */
  async listarRendimentos(req: Request, res: Response): Promise<void> {
    try {
      const contribuinteId = this.extrairParametro(req.params.contribuinteId);
      const { exercicio } = req.query;
      const resultado = await this.service.listarRendimentosPorExercicio(
        contribuinteId,
        exercicio
      );
      res.status(200).json({
        sucesso: true,
        dados: resultado,
      });
    } catch (erro: any) {
      this.tratarErro(erro, res);
    }
  }

  /**
   * DELETE /api/irpf/:contribuinteId/rendimentos/:id
   */
  async excluirRendimento(req: Request, res: Response): Promise<void> {
    try {
      const contribuinteId = this.extrairParametro(req.params.contribuinteId);
      const id = this.extrairParametro(req.params.id);
      const excluido = await this.service.excluirRendimento(contribuinteId, id);
      if (!excluido) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Rendimento não encontrado para este contribuinte.',
        });
        return;
      }
      res.status(200).json({
        sucesso: true,
        mensagem: 'Rendimento excluído com sucesso.',
      });
    } catch (erro: any) {
      this.tratarErro(erro, res);
    }
  }

  /**
   * POST /api/irpf/:contribuinteId/pagamentos
   * Registra pagamento dedutível por exercício (CA-2, CA-4, CA-5)
   */
  async criarPagamentoDeducao(req: Request, res: Response): Promise<void> {
    try {
      const contribuinteId = this.extrairParametro(req.params.contribuinteId);
      const pagamento = await this.service.registrarPagamentoDeducao(
        contribuinteId,
        req.body
      );
      res.status(201).json({
        sucesso: true,
        mensagem: 'Pagamento/despesa dedutível registrado com sucesso.',
        dados: pagamento,
      });
    } catch (erro: any) {
      this.tratarErro(erro, res);
    }
  }

  /**
   * GET /api/irpf/:contribuinteId/pagamentos?exercicio=YYYY
   * Consulta pagamentos dedutíveis por exercício e categoria com subtotais (CA-2, CA-3)
   */
  async listarPagamentos(req: Request, res: Response): Promise<void> {
    try {
      const contribuinteId = this.extrairParametro(req.params.contribuinteId);
      const { exercicio } = req.query;
      const resultado = await this.service.listarPagamentosPorExercicio(
        contribuinteId,
        exercicio
      );
      res.status(200).json({
        sucesso: true,
        dados: resultado,
      });
    } catch (erro: any) {
      this.tratarErro(erro, res);
    }
  }

  /**
   * DELETE /api/irpf/:contribuinteId/pagamentos/:id
   */
  async excluirPagamento(req: Request, res: Response): Promise<void> {
    try {
      const contribuinteId = this.extrairParametro(req.params.contribuinteId);
      const id = this.extrairParametro(req.params.id);
      const excluido = await this.service.excluirPagamentoDeducao(contribuinteId, id);
      if (!excluido) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Pagamento/dedução não encontrado para este contribuinte.',
        });
        return;
      }
      res.status(200).json({
        sucesso: true,
        mensagem: 'Pagamento/dedução excluído com sucesso.',
      });
    } catch (erro: any) {
      this.tratarErro(erro, res);
    }
  }

  /**
   * Tratamento padronizado de erros (CA-4)
   */
  private tratarErro(erro: any, res: Response): void {
    if (erro instanceof ZodError) {
      res.status(400).json({
        sucesso: false,
        mensagem: 'Erro de validação nos dados fornecidos.',
        erros: erro.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensagem: issue.message,
        })),
      });
      return;
    }

    res.status(400).json({
      sucesso: false,
      mensagem: erro?.message || 'Erro inesperado ao processar a requisição.',
    });
  }
}
