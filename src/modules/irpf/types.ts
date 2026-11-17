/**
 * Módulo IRPF - Tipos e Enumerações
 * Especificação: SPEC-3.14 (RF-031, RF-033, RF-041, RB-004, RB-005)
 */

/**
 * Tipos de rendimentos permitidos conforme legislação vigente e RF-031:
 * - TRIBUTAVEL_PJ: Rendimentos tributáveis recebidos de pessoa jurídica
 * - TRIBUTAVEL_PF: Rendimentos tributáveis recebidos de pessoa física
 * - ISENTO_NAO_TRIBUTAVEL: Rendimentos isentos e não tributáveis
 * - TRIBUTACAO_EXCLUSIVA: Rendimentos sujeitos à tributação exclusiva/definitiva
 * - RECEBIDO_ACUMULADAMENTE: Rendimentos recebidos acumuladamente (RRA)
 * - EXTERIOR: Rendimentos auferidos no exterior
 */
export enum TipoRendimento {
  TRIBUTAVEL_PJ = 'TRIBUTAVEL_PJ',
  TRIBUTAVEL_PF = 'TRIBUTAVEL_PF',
  ISENTO_NAO_TRIBUTAVEL = 'ISENTO_NAO_TRIBUTAVEL',
  TRIBUTACAO_EXCLUSIVA = 'TRIBUTACAO_EXCLUSIVA',
  RECEBIDO_ACUMULADAMENTE = 'RECEBIDO_ACUMULADAMENTE',
  EXTERIOR = 'EXTERIOR',
}

/**
 * Categorias de pagamentos e despesas dedutíveis conforme RF-033:
 * - MEDICA: Despesas médicas e hospitalares
 * - EDUCACAO: Despesas com instrução / educação
 * - PREVIDENCIA_OFICIAL: Contribuição à previdência social pública (INSS)
 * - PREVIDENCIA_COMPLEMENTAR: Previdência privada (PGBL / FAPI)
 * - PENSAO_ALIMENTICIA: Pensão alimentícia judicial ou escritura pública
 * - DOACAO: Doações efetuadas (incentivadas ou gerais)
 * - OUTRAS_DESPESAS: Outras despesas dedutíveis legais
 */
export enum CategoriaDeducao {
  MEDICA = 'MEDICA',
  EDUCACAO = 'EDUCACAO',
  PREVIDENCIA_OFICIAL = 'PREVIDENCIA_OFICIAL',
  PREVIDENCIA_COMPLEMENTAR = 'PREVIDENCIA_COMPLEMENTAR',
  PENSAO_ALIMENTICIA = 'PENSAO_ALIMENTICIA',
  DOACAO = 'DOACAO',
  OUTRAS_DESPESAS = 'OUTRAS_DESPESAS',
}

/**
 * Tipo do beneficiário do rendimento ou pagamento
 */
export enum BeneficiarioTipo {
  TITULAR = 'TITULAR',
  DEPENDENTE = 'DEPENDENTE',
  ALIMENTANDO = 'ALIMENTANDO',
}

/**
 * Origem dos dados conforme RB-005
 */
export enum OrigemDado {
  MANUAL = 'MANUAL',
  IMPORTADO = 'IMPORTADO',
}

/**
 * Entidade de Rendimento (RF-031)
 */
export interface Rendimento {
  id: string;
  contribuinteId: string;
  exercicio: number;
  tipoRendimento: TipoRendimento;
  beneficiarioTipo: BeneficiarioTipo;
  beneficiarioId?: string;
  fontePagadoraDocumento: string; // CPF ou CNPJ
  fontePagadoraNome: string;
  descricao?: string;
  valorRendimento: number;
  impostoRetidoFonte: number;
  previdenciaOficial: number;
  decimoTerceiro: number;
  origemDado: OrigemDado;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade de Pagamento / Despesa Dedutível (RF-033)
 */
export interface PagamentoDeducao {
  id: string;
  contribuinteId: string;
  exercicio: number;
  categoriaDeducao: CategoriaDeducao;
  beneficiarioTipo: BeneficiarioTipo;
  beneficiarioId?: string;
  favorecidoDocumento: string; // CPF ou CNPJ
  favorecidoNome: string;
  descricao?: string;
  valorPago: number;
  parcelaNaoDedutivelReembolso: number;
  origemDado: OrigemDado;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resultado da consulta de rendimentos por exercício com subtotais (CA-1, CA-3)
 */
export interface ConsultaRendimentosResultado {
  contribuinteId: string;
  exercicio: number;
  rendimentos: Rendimento[];
  subtotaisPorTipo: Record<TipoRendimento, number>;
  totalRendimentos: number;
  totalImpostoRetido: number;
}

/**
 * Resultado da consulta de pagamentos e despesas dedutíveis por exercício com subtotais (CA-2, CA-3)
 */
export interface ConsultaPagamentosResultado {
  contribuinteId: string;
  exercicio: number;
  pagamentos: PagamentoDeducao[];
  subtotaisPorCategoria: Record<CategoriaDeducao, number>;
  totalPago: number;
  totalDedutivelEstimado: number;
}
