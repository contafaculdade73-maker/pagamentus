/**
 * Suíte de Testes Automatizados - SPEC-3.14 (Rendimentos e deduções)
 * Validação de Critérios de Aceite (CA-1, CA-2, CA-3, CA-4, CA-5)
 * Requisitos: RF-031, RF-033, RF-041, RB-004, RB-005, RNF-013
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IrpfService } from '../../../src/modules/irpf/service';
import { InMemoryIrpfRepository } from '../../../src/modules/irpf/repository';
import {
  TipoRendimento,
  CategoriaDeducao,
  BeneficiarioTipo,
  OrigemDado,
} from '../../../src/modules/irpf/types';

describe('SPEC-3.14: Rendimentos e Deduções do IRPF', () => {
  let repository: InMemoryIrpfRepository;
  let service: IrpfService;
  const contribuinteId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    repository = new InMemoryIrpfRepository();
    service = new IrpfService(repository);
  });

  // ============================================================================
  // CA-1: Registro de rendimentos por tipo e exercício (RF-031)
  // Dado um contribuinte cadastrado e um exercício fiscal selecionado,
  // Quando o usuário registrar um rendimento informando o tipo, fonte e valor,
  // Então o sistema deve persistir com o tipo e exercício corretos.
  // ============================================================================
  describe('CA-1: Registro de rendimentos por tipo e exercício (RF-031)', () => {
    it('deve registrar com sucesso rendimento tributável de pessoa jurídica', async () => {
      const rendimento = await service.registrarRendimento(contribuinteId, {
        exercicio: 2025,
        tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
        fontePagadoraDocumento: '12.345.678/0001-90',
        fontePagadoraNome: 'Empresa Alfa Ltda',
        valorRendimento: 6500.5,
        impostoRetidoFonte: 850.0,
        previdenciaOficial: 715.0,
        origemDado: OrigemDado.MANUAL,
      });

      assert.ok(rendimento.id, 'Deve gerar um ID único');
      assert.equal(rendimento.contribuinteId, contribuinteId);
      assert.equal(rendimento.exercicio, 2025);
      assert.equal(rendimento.tipoRendimento, TipoRendimento.TRIBUTAVEL_PJ);
      assert.equal(rendimento.valorRendimento, 6500.5);
      assert.equal(rendimento.impostoRetidoFonte, 850.0);
    });

    it('deve registrar todos os tipos oficiais de rendimento previstos na legislação', async () => {
      const tipos: TipoRendimento[] = [
        TipoRendimento.TRIBUTAVEL_PJ,
        TipoRendimento.TRIBUTAVEL_PF,
        TipoRendimento.ISENTO_NAO_TRIBUTAVEL,
        TipoRendimento.TRIBUTACAO_EXCLUSIVA,
        TipoRendimento.RECEBIDO_ACUMULADAMENTE,
        TipoRendimento.EXTERIOR,
      ];

      for (const tipo of tipos) {
        const item = await service.registrarRendimento(contribuinteId, {
          exercicio: 2025,
          tipoRendimento: tipo,
          fontePagadoraDocumento: '98.765.432/0001-10',
          fontePagadoraNome: `Fonte ${tipo}`,
          valorRendimento: 1000.0,
        });

        assert.equal(item.tipoRendimento, tipo);
        assert.equal(item.exercicio, 2025);
      }

      const consulta = await service.listarRendimentosPorExercicio(contribuinteId, 2025);
      assert.equal(consulta.rendimentos.length, tipos.length);
    });
  });

  // ============================================================================
  // CA-2: Registro de despesas dedutíveis por exercício (RF-033)
  // Dado um contribuinte cadastrado e um exercício fiscal selecionado,
  // Quando o usuário registrar um pagamento informando a categoria dedutível,
  // Então o sistema deve registrar a despesa dedutível vinculada ao exercício.
  // ============================================================================
  describe('CA-2: Registro de despesas dedutíveis e pagamentos por exercício (RF-033)', () => {
    it('deve registrar com sucesso despesa médica vinculada ao exercício', async () => {
      const pagamento = await service.registrarPagamentoDeducao(contribuinteId, {
        exercicio: 2025,
        categoriaDeducao: CategoriaDeducao.MEDICA,
        beneficiarioTipo: BeneficiarioTipo.TITULAR,
        favorecidoDocumento: '123.456.789-00',
        favorecidoNome: 'Dr. Roberto Clínico Geral',
        valorPago: 1200.0,
        parcelaNaoDedutivelReembolso: 200.0,
      });

      assert.ok(pagamento.id);
      assert.equal(pagamento.contribuinteId, contribuinteId);
      assert.equal(pagamento.exercicio, 2025);
      assert.equal(pagamento.categoriaDeducao, CategoriaDeducao.MEDICA);
      assert.equal(pagamento.valorPago, 1200.0);
      assert.equal(pagamento.parcelaNaoDedutivelReembolso, 200.0);
    });

    it('deve registrar todas as categorias oficiais de despesas dedutíveis (educação, previdência, pensão, doação)', async () => {
      const categorias: CategoriaDeducao[] = [
        CategoriaDeducao.MEDICA,
        CategoriaDeducao.EDUCACAO,
        CategoriaDeducao.PREVIDENCIA_OFICIAL,
        CategoriaDeducao.PREVIDENCIA_COMPLEMENTAR,
        CategoriaDeducao.PENSAO_ALIMENTICIA,
        CategoriaDeducao.DOACAO,
        CategoriaDeducao.OUTRAS_DESPESAS,
      ];

      for (const cat of categorias) {
        const item = await service.registrarPagamentoDeducao(contribuinteId, {
          exercicio: 2025,
          categoriaDeducao: cat,
          beneficiarioTipo: BeneficiarioTipo.TITULAR,
          favorecidoDocumento: '11.222.333/0001-44',
          favorecidoNome: `Favorecido Categoria ${cat}`,
          valorPago: 500.0,
        });

        assert.equal(item.categoriaDeducao, cat);
        assert.equal(item.exercicio, 2025);
      }

      const consulta = await service.listarPagamentosPorExercicio(contribuinteId, 2025);
      assert.equal(consulta.pagamentos.length, categorias.length);
    });
  });

  // ============================================================================
  // CA-3: Segregação e consulta por exercício fiscal com subtotais
  // Dado lançamentos em múltiplos exercícios,
  // Quando consultar filtrando por exercício,
  // Então retorna exclusivamente daquele exercício, com subtotais por tipo/categoria.
  // ============================================================================
  describe('CA-3: Segregação e consulta por exercício fiscal', () => {
    it('deve retornar exclusivamente os rendimentos do exercício consultado com subtotais corretos', async () => {
      // Rendimentos do exercício 2024
      await service.registrarRendimento(contribuinteId, {
        exercicio: 2024,
        tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
        fontePagadoraDocumento: '11.111.111/0001-11',
        fontePagadoraNome: 'Fonte 2024',
        valorRendimento: 10000.0,
      });

      // Rendimentos do exercício 2025
      await service.registrarRendimento(contribuinteId, {
        exercicio: 2025,
        tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
        fontePagadoraDocumento: '22.222.222/0001-22',
        fontePagadoraNome: 'Fonte PJ 2025',
        valorRendimento: 5000.0,
        impostoRetidoFonte: 500.0,
      });
      await service.registrarRendimento(contribuinteId, {
        exercicio: 2025,
        tipoRendimento: TipoRendimento.ISENTO_NAO_TRIBUTAVEL,
        fontePagadoraDocumento: '33.333.333/0001-33',
        fontePagadoraNome: 'Fonte Isento 2025',
        valorRendimento: 2000.0,
      });

      // Consulta de 2025
      const resultado2025 = await service.listarRendimentosPorExercicio(contribuinteId, 2025);

      assert.equal(resultado2025.exercicio, 2025);
      assert.equal(resultado2025.rendimentos.length, 2, 'Deve conter apenas 2 lançamentos de 2025');
      assert.equal(resultado2025.subtotaisPorTipo[TipoRendimento.TRIBUTAVEL_PJ], 5000.0);
      assert.equal(resultado2025.subtotaisPorTipo[TipoRendimento.ISENTO_NAO_TRIBUTAVEL], 2000.0);
      assert.equal(resultado2025.subtotaisPorTipo[TipoRendimento.EXTERIOR], 0);
      assert.equal(resultado2025.totalRendimentos, 7000.0);
      assert.equal(resultado2025.totalImpostoRetido, 500.0);

      // Consulta de 2024
      const resultado2024 = await service.listarRendimentosPorExercicio(contribuinteId, 2024);
      assert.equal(resultado2024.rendimentos.length, 1);
      assert.equal(resultado2024.totalRendimentos, 10000.0);
    });

    it('deve retornar exclusivamente as despesas dedutíveis do exercício com subtotais por categoria', async () => {
      // Despesa em 2024
      await service.registrarPagamentoDeducao(contribuinteId, {
        exercicio: 2024,
        categoriaDeducao: CategoriaDeducao.EDUCACAO,
        favorecidoDocumento: '11.111.111/0001-11',
        favorecidoNome: 'Faculdade 2024',
        valorPago: 3000.0,
      });

      // Despesas em 2025
      await service.registrarPagamentoDeducao(contribuinteId, {
        exercicio: 2025,
        categoriaDeducao: CategoriaDeducao.MEDICA,
        favorecidoDocumento: '22.222.222/0001-22',
        favorecidoNome: 'Hospital 2025',
        valorPago: 4000.0,
        parcelaNaoDedutivelReembolso: 500.0,
      });
      await service.registrarPagamentoDeducao(contribuinteId, {
        exercicio: 2025,
        categoriaDeducao: CategoriaDeducao.EDUCACAO,
        favorecidoDocumento: '33.333.333/0001-33',
        favorecidoNome: 'Colégio 2025',
        valorPago: 2500.0,
      });

      const resultado2025 = await service.listarPagamentosPorExercicio(contribuinteId, 2025);

      assert.equal(resultado2025.exercicio, 2025);
      assert.equal(resultado2025.pagamentos.length, 2);
      assert.equal(resultado2025.subtotaisPorCategoria[CategoriaDeducao.MEDICA], 4000.0);
      assert.equal(resultado2025.subtotaisPorCategoria[CategoriaDeducao.EDUCACAO], 2500.0);
      assert.equal(resultado2025.subtotaisPorCategoria[CategoriaDeducao.PENSAO_ALIMENTICIA], 0);
      assert.equal(resultado2025.totalPago, 6500.0);
      assert.equal(resultado2025.totalDedutivelEstimado, 6000.0);
    });
  });

  // ============================================================================
  // CA-4: Validação de campos obrigatórios e bloqueio de valores negativos
  // Dado o formulário de cadastro,
  // Quando submeter com valor negativo ou campos obrigatórios ausentes,
  // Então o sistema rejeita a operação com mensagem de validação.
  // ============================================================================
  describe('CA-4: Validação de campos obrigatórios e valores não negativos', () => {
    it('deve rejeitar rendimento com valor negativo', async () => {
      await assert.rejects(
        async () => {
          await service.registrarRendimento(contribuinteId, {
            exercicio: 2025,
            tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
            fontePagadoraDocumento: '12.345.678/0001-90',
            fontePagadoraNome: 'Empresa Teste',
            valorRendimento: -150.0, // Negativo
          });
        },
        /valor do rendimento não pode ser negativo/i
      );
    });

    it('deve rejeitar rendimento sem fonte pagadora ou documento', async () => {
      await assert.rejects(
        async () => {
          await service.registrarRendimento(contribuinteId, {
            exercicio: 2025,
            tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
            fontePagadoraDocumento: '', // Vazio
            fontePagadoraNome: '',
            valorRendimento: 1000.0,
          });
        },
        /CPF ou CNPJ da fonte pagadora não pode ser vazio/i
      );
    });

    it('deve rejeitar pagamento com valor pago negativo', async () => {
      await assert.rejects(
        async () => {
          await service.registrarPagamentoDeducao(contribuinteId, {
            exercicio: 2025,
            categoriaDeducao: CategoriaDeducao.MEDICA,
            favorecidoDocumento: '123.456.789-00',
            favorecidoNome: 'Clínica Saúde',
            valorPago: -50.0, // Negativo
          });
        },
        /valor pago não pode ser negativo/i
      );
    });

    it('deve rejeitar categoria de dedução inválida', async () => {
      await assert.rejects(
        async () => {
          await service.registrarPagamentoDeducao(contribuinteId, {
            exercicio: 2025,
            categoriaDeducao: 'CATEGORIA_INVENTADA_INEXISTENTE' as any,
            favorecidoDocumento: '123.456.789-00',
            favorecidoNome: 'Clínica Saúde',
            valorPago: 100.0,
          });
        },
        /Categoria de dedução\/pagamento inválida/i
      );
    });
  });

  // ============================================================================
  // CA-5: Rastreabilidade e origem do dado (RB-005)
  // Dado o salvamento de um rendimento ou despesa dedutível,
  // Quando concluído,
  // Então o sistema armazena a procedência (MANUAL ou IMPORTADO) e os timestamps.
  // ============================================================================
  describe('CA-5: Rastreabilidade e origem dos dados (RB-005)', () => {
    it('deve registrar procedência MANUAL por padrão com carimbos de data/hora', async () => {
      const item = await service.registrarRendimento(contribuinteId, {
        exercicio: 2025,
        tipoRendimento: TipoRendimento.TRIBUTAVEL_PF,
        fontePagadoraDocumento: '123.456.789-01',
        fontePagadoraNome: 'Pessoa Física Pagadora',
        valorRendimento: 1800.0,
      });

      assert.equal(item.origemDado, OrigemDado.MANUAL);
      assert.ok(item.createdAt instanceof Date);
      assert.ok(item.updatedAt instanceof Date);
    });

    it('deve registrar procedência IMPORTADO quando indicado na integração', async () => {
      const item = await service.registrarPagamentoDeducao(contribuinteId, {
        exercicio: 2025,
        categoriaDeducao: CategoriaDeducao.PREVIDENCIA_COMPLEMENTAR,
        favorecidoDocumento: '12.345.678/0001-90',
        favorecidoNome: 'Fundo de Previdência FAPI',
        valorPago: 3200.0,
        origemDado: OrigemDado.IMPORTADO,
      });

      assert.equal(item.origemDado, OrigemDado.IMPORTADO);
      assert.ok(item.createdAt instanceof Date);
    });
  });

  // ============================================================================
  // Exclusão de lançamentos
  // ============================================================================
  describe('Exclusão de lançamentos', () => {
    it('deve excluir rendimento existente com sucesso', async () => {
      const rendimento = await service.registrarRendimento(contribuinteId, {
        exercicio: 2025,
        tipoRendimento: TipoRendimento.TRIBUTAVEL_PJ,
        fontePagadoraDocumento: '11.111.111/0001-11',
        fontePagadoraNome: 'Empresa Para Excluir',
        valorRendimento: 1000.0,
      });

      const excluiu = await service.excluirRendimento(contribuinteId, rendimento.id);
      assert.equal(excluiu, true);

      const lista = await service.listarRendimentosPorExercicio(contribuinteId, 2025);
      assert.equal(lista.rendimentos.length, 0);
    });

    it('deve excluir pagamento dedutível existente com sucesso', async () => {
      const pagamento = await service.registrarPagamentoDeducao(contribuinteId, {
        exercicio: 2025,
        categoriaDeducao: CategoriaDeducao.MEDICA,
        favorecidoDocumento: '11.111.111/0001-11',
        favorecidoNome: 'Consulta Médica',
        valorPago: 400.0,
      });

      const excluiu = await service.excluirPagamentoDeducao(contribuinteId, pagamento.id);
      assert.equal(excluiu, true);

      const lista = await service.listarPagamentosPorExercicio(contribuinteId, 2025);
      assert.equal(lista.pagamentos.length, 0);
    });
  });
});
