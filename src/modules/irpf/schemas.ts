/**
 * Módulo IRPF - Esquemas de Validação (Zod)
 * Especificação: SPEC-3.14 (CA-4, RF-041, RNF-013)
 */

import { z } from 'zod';
import { TipoRendimento, CategoriaDeducao, BeneficiarioTipo, OrigemDado } from './types';

/**
 * Expressão regular para validação simples de CPF ou CNPJ formatado ou apenas dígitos
 */
const documentoRegex = /^(\d{11}|\d{14}|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/;

/**
 * Esquema de validação para cadastro de Rendimento (RF-031, CA-1, CA-4)
 */
export const CriarRendimentoSchema = z.object({
  exercicio: z
    .number({
      error: 'O exercício fiscal deve ser um número inteiro (ano-calendário).',
    })
    .int('O exercício deve ser um ano inteiro.')
    .min(2000, 'Exercício fiscal inválido.')
    .max(2100, 'Exercício fiscal inválido.'),
  tipoRendimento: z.nativeEnum(TipoRendimento, {
    error: 'Tipo de rendimento inválido ou não informado.',
  }),
  beneficiarioTipo: z.nativeEnum(BeneficiarioTipo).default(BeneficiarioTipo.TITULAR),
  beneficiarioId: z.string().uuid('ID do beneficiário deve ser um UUID válido.').optional(),
  fontePagadoraDocumento: z
    .string({
      error: 'O CPF ou CNPJ da fonte pagadora é obrigatório.',
    })
    .trim()
    .min(1, 'O CPF ou CNPJ da fonte pagadora não pode ser vazio.')
    .regex(documentoRegex, 'Documento da fonte pagadora deve ser um CPF ou CNPJ válido.'),
  fontePagadoraNome: z
    .string({
      error: 'O nome ou razão social da fonte pagadora é obrigatório.',
    })
    .trim()
    .min(1, 'O nome ou razão social da fonte pagadora não pode ser vazio.')
    .max(255, 'O nome da fonte pagadora não pode ultrapassar 255 caracteres.'),
  descricao: z.string().trim().max(1000).optional(),
  valorRendimento: z
    .number({
      error: 'O valor do rendimento é obrigatório e deve ser numérico.',
    })
    .min(0, 'O valor do rendimento não pode ser negativo.'),
  impostoRetidoFonte: z
    .number()
    .min(0, 'O imposto retido na fonte não pode ser negativo.')
    .default(0),
  previdenciaOficial: z
    .number()
    .min(0, 'A previdência oficial não pode ser negativa.')
    .default(0),
  decimoTerceiro: z
    .number()
    .min(0, 'O valor do décimo terceiro não pode ser negativo.')
    .default(0),
  origemDado: z.nativeEnum(OrigemDado).default(OrigemDado.MANUAL),
});

export type CriarRendimentoInput = z.infer<typeof CriarRendimentoSchema>;

/**
 * Esquema de validação para cadastro de Pagamento / Despesa Dedutível (RF-033, CA-2, CA-4)
 */
export const CriarPagamentoDeducaoSchema = z.object({
  exercicio: z
    .number({
      error: 'O exercício fiscal deve ser um número inteiro (ano-calendário).',
    })
    .int('O exercício deve ser um ano inteiro.')
    .min(2000, 'Exercício fiscal inválido.')
    .max(2100, 'Exercício fiscal inválido.'),
  categoriaDeducao: z.nativeEnum(CategoriaDeducao, {
    error: 'Categoria de dedução/pagamento inválida ou não informada.',
  }),
  beneficiarioTipo: z.nativeEnum(BeneficiarioTipo).default(BeneficiarioTipo.TITULAR),
  beneficiarioId: z.string().uuid('ID do beneficiário deve ser um UUID válido.').optional(),
  favorecidoDocumento: z
    .string({
      error: 'O CPF ou CNPJ do favorecido/prestador é obrigatório.',
    })
    .trim()
    .min(1, 'O CPF ou CNPJ do favorecido não pode ser vazio.')
    .regex(documentoRegex, 'Documento do favorecido deve ser um CPF ou CNPJ válido.'),
  favorecidoNome: z
    .string({
      error: 'O nome ou razão social do favorecido é obrigatório.',
    })
    .trim()
    .min(1, 'O nome ou razão social do favorecido não pode ser vazio.')
    .max(255, 'O nome do favorecido não pode ultrapassar 255 caracteres.'),
  descricao: z.string().trim().max(1000).optional(),
  valorPago: z
    .number({
      error: 'O valor pago é obrigatório e deve ser numérico.',
    })
    .min(0, 'O valor pago não pode ser negativo.'),
  parcelaNaoDedutivelReembolso: z
    .number()
    .min(0, 'A parcela não dedutível ou reembolsada não pode ser negativa.')
    .default(0),
  origemDado: z.nativeEnum(OrigemDado).default(OrigemDado.MANUAL),
});

export type CriarPagamentoDeducaoInput = z.infer<typeof CriarPagamentoDeducaoSchema>;

/**
 * Validação de parâmetro de consulta de exercício fiscal
 */
export const ConsultaExercicioSchema = z.object({
  exercicio: z.coerce
    .number({
      error: 'O parâmetro exercicio deve ser informado e ser um número válido.',
    })
    .int('O exercício deve ser um ano inteiro.')
    .min(2000, 'Exercício mínimo é 2000.')
    .max(2100, 'Exercício máximo é 2100.'),
});
