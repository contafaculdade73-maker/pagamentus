/**
 * Módulo IRPF - Repositório de Rendimentos e Pagamentos/Deduções
 * Especificação: SPEC-3.14 (RF-031, RF-033, RNF-013)
 */

import { randomUUID } from 'crypto';
import {
  Rendimento,
  PagamentoDeducao,
  TipoRendimento,
  CategoriaDeducao,
} from './types';
import { CriarRendimentoInput, CriarPagamentoDeducaoInput } from './schemas';

export interface IIrpfRepository {
  // Operações de Rendimentos (RF-031)
  salvarRendimento(contribuinteId: string, dados: CriarRendimentoInput): Promise<Rendimento>;
  buscarRendimentosPorExercicio(contribuinteId: string, exercicio: number): Promise<Rendimento[]>;
  buscarRendimentoPorId(contribuinteId: string, id: string): Promise<Rendimento | null>;
  excluirRendimento(contribuinteId: string, id: string): Promise<boolean>;

  // Operações de Pagamentos e Despesas Dedutíveis (RF-033)
  salvarPagamentoDeducao(contribuinteId: string, dados: CriarPagamentoDeducaoInput): Promise<PagamentoDeducao>;
  buscarPagamentosPorExercicio(contribuinteId: string, exercicio: number): Promise<PagamentoDeducao[]>;
  buscarPagamentoPorId(contribuinteId: string, id: string): Promise<PagamentoDeducao | null>;
  excluirPagamentoDeducao(contribuinteId: string, id: string): Promise<boolean>;

  // Limpeza (para isolamento de testes)
  limpar(): Promise<void>;
}

/**
 * Implementação em memória do repositório para desenvolvimento e testes automatizados.
 * Garante fidelidade com as restrições e relacionamentos definidos no SPEC-3.14.
 */
export class InMemoryIrpfRepository implements IIrpfRepository {
  private rendimentos: Rendimento[] = [];
  private pagamentos: PagamentoDeducao[] = [];

  async salvarRendimento(
    contribuinteId: string,
    dados: CriarRendimentoInput
  ): Promise<Rendimento> {
    const agora = new Date();
    const novoRendimento: Rendimento = {
      id: randomUUID(),
      contribuinteId,
      exercicio: dados.exercicio,
      tipoRendimento: dados.tipoRendimento,
      beneficiarioTipo: dados.beneficiarioTipo,
      beneficiarioId: dados.beneficiarioId,
      fontePagadoraDocumento: dados.fontePagadoraDocumento,
      fontePagadoraNome: dados.fontePagadoraNome,
      descricao: dados.descricao,
      valorRendimento: Number(dados.valorRendimento.toFixed(2)),
      impostoRetidoFonte: Number((dados.impostoRetidoFonte || 0).toFixed(2)),
      previdenciaOficial: Number((dados.previdenciaOficial || 0).toFixed(2)),
      decimoTerceiro: Number((dados.decimoTerceiro || 0).toFixed(2)),
      origemDado: dados.origemDado,
      createdAt: agora,
      updatedAt: agora,
    };

    this.rendimentos.push(novoRendimento);
    return { ...novoRendimento };
  }

  async buscarRendimentosPorExercicio(
    contribuinteId: string,
    exercicio: number
  ): Promise<Rendimento[]> {
    return this.rendimentos
      .filter(
        (r) => r.contribuinteId === contribuinteId && r.exercicio === exercicio
      )
      .map((r) => ({ ...r }));
  }

  async buscarRendimentoPorId(
    contribuinteId: string,
    id: string
  ): Promise<Rendimento | null> {
    const item = this.rendimentos.find(
      (r) => r.contribuinteId === contribuinteId && r.id === id
    );
    return item ? { ...item } : null;
  }

  async excluirRendimento(
    contribuinteId: string,
    id: string
  ): Promise<boolean> {
    const indice = this.rendimentos.findIndex(
      (r) => r.contribuinteId === contribuinteId && r.id === id
    );
    if (indice === -1) return false;
    this.rendimentos.splice(indice, 1);
    return true;
  }

  async salvarPagamentoDeducao(
    contribuinteId: string,
    dados: CriarPagamentoDeducaoInput
  ): Promise<PagamentoDeducao> {
    const agora = new Date();
    const novoPagamento: PagamentoDeducao = {
      id: randomUUID(),
      contribuinteId,
      exercicio: dados.exercicio,
      categoriaDeducao: dados.categoriaDeducao,
      beneficiarioTipo: dados.beneficiarioTipo,
      beneficiarioId: dados.beneficiarioId,
      favorecidoDocumento: dados.favorecidoDocumento,
      favorecidoNome: dados.favorecidoNome,
      descricao: dados.descricao,
      valorPago: Number(dados.valorPago.toFixed(2)),
      parcelaNaoDedutivelReembolso: Number(
        (dados.parcelaNaoDedutivelReembolso || 0).toFixed(2)
      ),
      origemDado: dados.origemDado,
      createdAt: agora,
      updatedAt: agora,
    };

    this.pagamentos.push(novoPagamento);
    return { ...novoPagamento };
  }

  async buscarPagamentosPorExercicio(
    contribuinteId: string,
    exercicio: number
  ): Promise<PagamentoDeducao[]> {
    return this.pagamentos
      .filter(
        (p) => p.contribuinteId === contribuinteId && p.exercicio === exercicio
      )
      .map((p) => ({ ...p }));
  }

  async buscarPagamentoPorId(
    contribuinteId: string,
    id: string
  ): Promise<PagamentoDeducao | null> {
    const item = this.pagamentos.find(
      (p) => p.contribuinteId === contribuinteId && p.id === id
    );
    return item ? { ...item } : null;
  }

  async excluirPagamentoDeducao(
    contribuinteId: string,
    id: string
  ): Promise<boolean> {
    const indice = this.pagamentos.findIndex(
      (p) => p.contribuinteId === contribuinteId && p.id === id
    );
    if (indice === -1) return false;
    this.pagamentos.splice(indice, 1);
    return true;
  }

  async limpar(): Promise<void> {
    this.rendimentos = [];
    this.pagamentos = [];
  }
}
