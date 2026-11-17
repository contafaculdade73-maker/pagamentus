-- ==============================================================================
-- Migração: Criação das tabelas de Rendimentos e Pagamentos/Deduções do IRPF
-- Especificação: SPEC-3.14 (RF-031, RF-033, RF-041, RB-004, RB-005, RNF-013)
-- ==============================================================================

-- 1. Tabela de Rendimentos (RF-031)
-- Registra rendimentos tributáveis, isentos, exclusiva, acumulados e exterior por exercício
CREATE TABLE IF NOT EXISTS irpf_rendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribuinte_id UUID NOT NULL,
    exercicio INTEGER NOT NULL,
    tipo_rendimento VARCHAR(40) NOT NULL,
    beneficiario_tipo VARCHAR(20) NOT NULL DEFAULT 'TITULAR',
    beneficiario_id UUID NULL,
    fonte_pagadora_documento VARCHAR(18) NOT NULL,
    fonte_pagadora_nome VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    valor_rendimento NUMERIC(15, 2) NOT NULL,
    imposto_retido_fonte NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    previdencia_oficial NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    decimo_terceiro NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    origem_dado VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Restrições de integridade (RNF-013, CA-4)
    CONSTRAINT chk_irpf_rendimentos_valor CHECK (valor_rendimento >= 0),
    CONSTRAINT chk_irpf_rendimentos_irrf CHECK (imposto_retido_fonte >= 0),
    CONSTRAINT chk_irpf_rendimentos_previdencia CHECK (previdencia_oficial >= 0),
    CONSTRAINT chk_irpf_rendimentos_decimo_terceiro CHECK (decimo_terceiro >= 0),
    CONSTRAINT chk_irpf_rendimentos_tipo CHECK (
        tipo_rendimento IN (
            'TRIBUTAVEL_PJ',
            'TRIBUTAVEL_PF',
            'ISENTO_NAO_TRIBUTAVEL',
            'TRIBUTACAO_EXCLUSIVA',
            'RECEBIDO_ACUMULADAMENTE',
            'EXTERIOR'
        )
    ),
    CONSTRAINT chk_irpf_rendimentos_origem CHECK (
        origem_dado IN ('MANUAL', 'IMPORTADO')
    ),
    CONSTRAINT chk_irpf_rendimentos_beneficiario CHECK (
        beneficiario_tipo IN ('TITULAR', 'DEPENDENTE')
    )
);

-- Índice para busca e segregação por exercício e tipo (CA-1, CA-3)
CREATE INDEX IF NOT EXISTS idx_irpf_rendimentos_exercicio 
ON irpf_rendimentos (contribuinte_id, exercicio, tipo_rendimento);


-- 2. Tabela de Pagamentos e Despesas Dedutíveis (RF-033)
-- Registra previdência, despesas médicas, educação, pensão e doações por exercício
CREATE TABLE IF NOT EXISTS irpf_pagamentos_deducoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribuinte_id UUID NOT NULL,
    exercicio INTEGER NOT NULL,
    categoria_deducao VARCHAR(40) NOT NULL,
    beneficiario_tipo VARCHAR(20) NOT NULL DEFAULT 'TITULAR',
    beneficiario_id UUID NULL,
    favorecido_documento VARCHAR(18) NOT NULL,
    favorecido_nome VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    valor_pago NUMERIC(15, 2) NOT NULL,
    parcela_nao_dedutivel_reembolso NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    origem_dado VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Restrições de integridade (RNF-013, CA-4)
    CONSTRAINT chk_irpf_pagamentos_valor CHECK (valor_pago >= 0),
    CONSTRAINT chk_irpf_pagamentos_parcela CHECK (parcela_nao_dedutivel_reembolso >= 0),
    CONSTRAINT chk_irpf_pagamentos_categoria CHECK (
        categoria_deducao IN (
            'MEDICA',
            'EDUCACAO',
            'PREVIDENCIA_OFICIAL',
            'PREVIDENCIA_COMPLEMENTAR',
            'PENSAO_ALIMENTICIA',
            'DOACAO',
            'OUTRAS_DESPESAS'
        )
    ),
    CONSTRAINT chk_irpf_pagamentos_origem CHECK (
        origem_dado IN ('MANUAL', 'IMPORTADO')
    ),
    CONSTRAINT chk_irpf_pagamentos_beneficiario CHECK (
        beneficiario_tipo IN ('TITULAR', 'DEPENDENTE', 'ALIMENTANDO')
    )
);

-- Índice para busca e segregação por exercício e categoria (CA-2, CA-3)
CREATE INDEX IF NOT EXISTS idx_irpf_pagamentos_exercicio 
ON irpf_pagamentos_deducoes (contribuinte_id, exercicio, categoria_deducao);
