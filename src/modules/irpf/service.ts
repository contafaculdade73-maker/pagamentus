/**
 * Módulo IRPF - Serviço de Negócio para Rendimentos e Deduções
 * Especificação: SPEC-3.14 (RF-031, RF-033, CA-1, CA-2, CA-3, CA-4, CA-5, RB-004, RB-005)
 */

import {
  IIrpfRepository,
  InMemoryIrpfRepository,
} from './repository';
import {
  Rendimento,
  PagamentoDeducao,
  TipoRendimento,
  CategoriaDeducao,
  ConsultaRendimentosResultado,
  ConsultaPagamentosResultado,
} from './types';
import {
  CriarRendimentoSchema,
  CriarRendimentoInput,
  CriarPagamentoDeducaoSchema,
  CriarPagamentoDeducaoInput,
  ConsultaExercicioSchema,
} from './schemas';

export class IrpfService {
  constructor(private readonly repository: IIrpfRepository = new InMemoryIrpfRepository()) {}

  /**
   * Registra um novo rendimento vinculado ao contribuinte e exercício (RF-031, CA-1, CA-4, CA-5)
   */
  async registrarRendimento(
    contribuinteId: string,
    dadosBrutos: unknown
  ): Promise<Rendimento> {
    if (!contribuinteId || contribuinteId.trim() === '') {
      throw new Error('ID do contribuinte é obrigatório.');
    }

    // Validação estrita via Zod (CA-4)
    const dadosValidados = CriarRendimentoSchema.parse(dadosBrutos);

    // Persistência com tipo e exercício garantidos (CA-1, CA-5)
    return this.repository.salvarRendimento(contribuinteId, dadosValidados);
  }

  /**
   * Consulta rendimentos do contribuinte filtrados por exercício fiscal com subtotais por tipo (RF-031, CA-1, CA-3)
   */
  async listarRendimentosPorExercicio(
    contribuinteId: string,
    exercicioBruto: unknown
  ): Promise<ConsultaRendimentosResultado> {
    if (!contribuinteId || contribuinteId.trim() === '') {
      throw new Error('ID do contribuinte é obrigatório.');
    }

    const { exercicio } = ConsultaExercicioSchema.parse({ exercicio: exercicioBruto });
    const rendimentos = await this.repository.buscarRendimentosPorExercicio(contribuinteId, exercicio);

    // Inicialização dos subtotais para todos os tipos oficiais de rendimento (CA-1, CA-3)
    const subtotaisPorTipo: Record<TipoRendimento, number> = {
      [TipoRendimento.TRIBUTAVEL_PJ]: 0,
      [TipoRendimento.TRIBUTAVEL_PF]: 0,
      [TipoRendimento.ISENTO_NAO_TRIBUTAVEL]: 0,
      [TipoRendimento.TRIBUTACAO_EXCLUSIVA]: 0,
      [TipoRendimento.RECEBIDO_ACUMULADAMENTE]: 0,
      [TipoRendimento.EXTERIOR]: 0,
    };

    let totalRendimentos = 0;
    let totalImpostoRetido = 0;

    for (const rendimento of rendimentos) {
      subtotaisPorTipo[rendimento.tipoRendimento] = Number(
        (subtotaisPorTipo[rendimento.tipoRendimento] + rendimento.valorRendimento).toFixed(2)
      );
      totalRendimentos = Number((totalRendimentos + rendimento.valorRendimento).toFixed(2));
      totalImpostoRetido = Number((totalImpostoRetido + rendimento.impostoRetidoFonte).toFixed(2));
    }

    return {
      contribuinteId,
      exercicio,
      rendimentos,
      subtotaisPorTipo,
      totalRendimentos,
      totalImpostoRetido,
    };
  }

  /**
   * Exclui um rendimento existente
   */
  async excluirRendimento(contribuinteId: string, id: string): Promise<boolean> {
    const rendimento = await this.repository.buscarRendimentoPorId(contribuinteId, id);
    if (!rendimento) {
      return false;
    }
    return this.repository.excluirRendimento(contribuinteId, id);
  }

  /**
   * Registra um pagamento ou despesa dedutível vinculado ao contribuinte e exercício (RF-033, CA-2, CA-4, CA-5)
   */
  async registrarPagamentoDeducao(
    contribuinteId: string,
    dadosBrutos: unknown
  ): Promise<PagamentoDeducao> {
    if (!contribuinteId || contribuinteId.trim() === '') {
      throw new Error('ID do contribuinte é obrigatório.');
    }

    // Validação estrita via Zod (CA-4)
    const dadosValidados = CriarPagamentoDeducaoSchema.parse(dadosBrutos);

    // Persistência com categoria e exercício garantidos (CA-2, CA-5)
    return this.repository.salvarPagamentoDeducao(contribuinteId, dadosValidados);
  }

  /**
   * Consulta pagamentos e despesas dedutíveis filtrados por exercício com subtotais por categoria (RF-033, CA-2, CA-3)
   */
  async listarPagamentosPorExercicio(
    contribuinteId: string,
    exercicioBruto: unknown
  ): Promise<ConsultaPagamentosResultado> {
    if (!contribuinteId || contribuinteId.trim() === '') {
      throw new Error('ID do contribuinte é obrigatório.');
    }

    const { exercicio } = ConsultaExercicioSchema.parse({ exercicio: exercicioBruto });
    const pagamentos = await this.repository.buscarPagamentosPorExercicio(contribuinteId, exercicio);

    // Inicialização dos subtotais para todas as categorias oficiais de dedução (CA-2, CA-3)
    const subtotaisPorCategoria: Record<CategoriaDeducao, number> = {
      [CategoriaDeducao.MEDICA]: 0,
      [CategoriaDeducao.EDUCACAO]: 0,
      [CategoriaDeducao.PREVIDENCIA_OFICIAL]: 0,
      [CategoriaDeducao.PREVIDENCIA_COMPLEMENTAR]: 0,
      [CategoriaDeducao.PENSAO_ALIMENTICIA]: 0,
      [CategoriaDeducao.DOACAO]: 0,
      [CategoriaDeducao.OUTRAS_DESPESAS]: 0,
    };

    let totalPago = 0;
    let totalNaoDedutivel = 0;

    for (const pagamento of pagamentos) {
      subtotaisPorCategoria[pagamento.categoriaDeducao] = Number(
        (subtotaisPorCategoria[pagamento.categoriaDeducao] + pagamento.valorPago).toFixed(2)
      );
      totalPago = Number((totalPago + pagamento.valorPago).toFixed(2));
      totalNaoDedutivel = Number(
        (totalNaoDedutivel + pagamento.parcelaNaoDedutivelReembolso).toFixed(2)
      );
    }

    const totalDedutivelEstimado = Number(
      Math.max(0, totalPago - totalNaoDedutivel).toFixed(2)
    );

    return {
      contribuinteId,
      exercicio,
      pagamentos,
      subtotaisPorCategoria,
      totalPago,
      totalDedutivelEstimado,
    };
  }

  /**
   * Exclui um pagamento dedutível existente
   */
  async excluirPagamentoDeducao(contribuinteId: string, id: string): Promise<boolean> {
    const pagamento = await this.repository.buscarPagamentoPorId(contribuinteId, id);
    if (!pagamento) {
      return false;
    }
    return this.repository.excluirPagamentoDeducao(contribuinteId, id);
  }
}
