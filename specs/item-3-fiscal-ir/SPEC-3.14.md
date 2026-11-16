# SPEC-3.14 – Rendimentos e deduções

| Item | Responsável | Revisor (4º período) | Trello | Status |
|---|---|---|---|---|
| 3 – Fiscal, tributos e Imposto de Renda | Matheus (@matheus) | A definir | A definir | Fazendo |

## 1. Contexto e objetivo
No módulo de Imposto de Renda Pessoa Física (IRPF), a declaração anual e a apuração exigem a organização precisa dos rendimentos obtidos e dos pagamentos e despesas efetuados pelo contribuinte. Esta especificação define a coleta, classificação por tipo e registro das despesas dedutíveis e rendimentos vinculados ao contribuinte e segregados por exercício fiscal (ano-calendário), estabelecendo a base de dados consistente para a declaração de IRPF sem extrapolar as regras oficiais do exercício.

## 2. Requisitos relacionados
- **RF-031**: Coletar rendimentos tributáveis, isentos/não tributáveis, sujeitos à tributação exclusiva, rendimentos recebidos acumuladamente e rendimentos do exterior, quando aplicável.
- **RF-033**: Registrar pagamentos e despesas dedutíveis, contribuições, previdência, despesas médicas, educação, pensão e doações, conforme regras aplicáveis.
- **RF-041**: Não inventar campos, deduções, limites ou regras; atualizar o sistema por exercício fiscal e validar com orientações oficiais vigentes.
- **RB-004**: Cálculos fiscais e de IR devem usar regras específicas do exercício, regime, jurisdição e situação do contribuinte.
- **RB-005**: O sistema deve distinguir dados informados pelo cliente, dados importados, cálculos do sistema e dados revisados pelo profissional.
- **RNF-013 — Integridade**: Usar transações, chaves e validações para impedir duplicidade, perda de dados e lançamentos inconsistentes.

## 3. Escopo
- **Dentro do escopo:**
  - Coleta e cadastro de rendimentos classificados por tipo oficial:
    - Rendimentos tributáveis (recebidos de pessoa jurídica ou de pessoa física);
    - Rendimentos isentos e não tributáveis;
    - Rendimentos sujeitos à tributação exclusiva/definitiva;
    - Rendimentos recebidos acumuladamente (RRA);
    - Rendimentos auferidos no exterior.
  - Registro de pagamentos e despesas dedutíveis conforme regras aplicáveis:
    - Previdência oficial e previdência complementar;
    - Despesas médicas e de saúde;
    - Despesas com instrução e educação;
    - Pensão alimentícia judicial ou por escritura pública;
    - Doações efetuadas (incentivadas ou gerais);
    - Contribuições e outros pagamentos dedutíveis previstos na legislação.
  - Associação obrigatória de cada lançamento a um contribuinte e a um exercício fiscal (ano-calendário).
  - Identificação de beneficiário (titular ou dependente/alimentando).
  - Coleta de dados da fonte pagadora (no caso de rendimentos) e do favorecido/prestador (no caso de despesas), incluindo CPF/CNPJ e nome/razão social.
  - Registro da origem do dado (informado manualmente ou importado), conforme RB-005.
  - Validações de integridade: bloqueio de valores negativos e obrigatoriedade de campos essenciais.
- **Fora do escopo:**
  - Cálculo final do imposto apurado, saldo a pagar ou restituir (escopo de spec de cálculo/apuração de IRPF).
  - Comparação automática entre modelos de tributação (desconto simplificado vs. deduções legais - RF-037).
  - Conferência de consistência patrimonial e cruzamento de dados de malha fina (RF-036).
  - Importação de arquivos ou informes de rendimentos bancários/folha (RF-035).
  - Transmissão externa da declaração à Receita Federal (RF-040).

## 4. Comportamento esperado
- **Fluxo normal (Registro de Rendimento):** O usuário seleciona o contribuinte e o exercício fiscal correspondente. Em seguida, registra o rendimento especificando seu tipo (tributável, isento, tributação exclusiva, acumulado ou exterior), identificando a fonte pagadora (CPF/CNPJ e nome), descrição e valor bruto. O sistema valida os campos e salva o rendimento vinculado ao exercício.
- **Fluxo normal (Registro de Despesa Dedutível / Pagamento):** O usuário seleciona o contribuinte e o exercício fiscal. Em seguida, informa a despesa dedutível indicando a categoria (médica, educação, previdência, pensão, doação ou outra contribuição dedutível), o beneficiário (titular ou dependente), os dados do favorecido (CPF/CNPJ e nome) e o valor pago. O sistema valida e registra a despesa associada ao exercício.
- **Fluxo normal (Consulta e Segregação por Exercício):** O usuário acessa a ficha de IRPF do contribuinte e filtra por um exercício fiscal específico. O sistema retorna exclusivamente os rendimentos daquele exercício agrupados por tipo e as despesas agrupadas por categoria, com seus respectivos subtotais.
- **Fluxo de exceção (Dados Inválidos ou Incompletos):** Caso o usuário informe valor monetário negativo, deixe campos obrigatórios em branco (como CPF/CNPJ do favorecido/fonte ou identificação do tipo/categoria) ou não informe um exercício válido, o sistema bloqueia o registro e exibe mensagem de erro orientativa, preservando a integridade dos dados.

## 5. Critérios de aceite
- **CA-1 (Registro de rendimentos por tipo e exercício - RF-031):** Dado um contribuinte cadastrado e um exercício fiscal selecionado, quando o usuário registrar um rendimento informando o tipo (tributável, isento/não tributável, tributação exclusiva, acumulado ou exterior), fonte pagadora (CPF/CNPJ e nome) e valor, então o sistema deve persistir o rendimento classificado pelo seu respectivo tipo e vinculado ao contribuinte e ao exercício fiscal informado.
- **CA-2 (Registro de despesas dedutíveis por exercício - RF-033):** Dado um contribuinte cadastrado e um exercício fiscal selecionado, quando o usuário registrar um pagamento informando a categoria dedutível (despesa médica, educação, previdência, pensão ou doação), beneficiário, favorecido (CPF/CNPJ e nome) e valor pago, então o sistema deve registrar a despesa dedutível vinculada ao contribuinte e ao exercício correspondente.
- **CA-3 (Segregação e consulta por exercício fiscal):** Dado um contribuinte com lançamentos em múltiplos exercícios fiscais, quando for solicitada a listagem com filtro por um exercício específico, então o sistema deve retornar exclusivamente os rendimentos e pagamentos daquele exercício, apresentando os registros agrupados por tipo/categoria com seus respectivos subtotais.
- **CA-4 (Validação de campos obrigatórios e valores monetários):** Dado o formulário de cadastro de rendimento ou pagamento dedutível, quando o usuário tentar salvar um registro com valor negativo, documento em branco ou sem tipo/categoria definido, então o sistema deve impedir a gravação e exibir mensagem de validação indicando as pendências.
- **CA-5 (Rastreabilidade e origem do dado - RB-005):** Dado o salvamento de um rendimento ou despesa dedutível, quando a operação for concluída com sucesso, então o sistema deve registrar a procedência da informação (manual ou importada) e os carimbos de data/hora do registro.

## 6. Plano técnico
- **Telas / Interface:**
  - Painel de IRPF do Contribuinte com seletor de Exercício Fiscal (ano-calendário).
  - Painel de Rendimentos com visualização agrupada por tipo (Tributáveis, Isentos, Tributação Exclusiva, RRA e Exterior) com subtotais e formulário modal de cadastro.
  - Painel de Pagamentos e Deduções com visualização categorizada (Saúde, Educação, Previdência, Pensão, Doações) com indicação de titular/dependente e totais por grupo.
- **Modelo de Dados (PostgreSQL):**
  - Tabela `irpf_rendimentos`:
    - `id`: UUID (Chave primária)
    - `contribuinte_id`: UUID (FK referenciando contribuinte)
    - `exercicio`: INTEGER (Ano-calendário do exercício fiscal, ex.: 2025)
    - `tipo_rendimento`: VARCHAR(40) (`TRIBUTAVEL_PJ`, `TRIBUTAVEL_PF`, `ISENTO_NAO_TRIBUTAVEL`, `TRIBUTACAO_EXCLUSIVA`, `RECEBIDO_ACUMULADAMENTE`, `EXTERIOR`)
    - `beneficiario_tipo`: VARCHAR(20) (`TITULAR`, `DEPENDENTE`)
    - `beneficiario_id`: UUID (Opcional, identificador do dependente quando aplicável)
    - `fonte_pagadora_documento`: VARCHAR(18) (CPF ou CNPJ)
    - `fonte_pagadora_nome`: VARCHAR(255)
    - `descricao`: TEXT (Opcional)
    - `valor_rendimento`: NUMERIC(15,2) (Restrição: `CHECK (valor_rendimento >= 0)`)
    - `imposto_retido_fonte`: NUMERIC(15,2) (Padrão 0.00, `CHECK (imposto_retido_fonte >= 0)`)
    - `previdencia_oficial`: NUMERIC(15,2) (Padrão 0.00, `CHECK (previdencia_oficial >= 0)`)
    - `decimo_terceiro`: NUMERIC(15,2) (Padrão 0.00, quando aplicável)
    - `origem_dado`: VARCHAR(20) (`MANUAL`, `IMPORTADO`)
    - `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE
    - Índice: `CREATE INDEX idx_irpf_rendimentos_exercicio ON irpf_rendimentos (contribuinte_id, exercicio, tipo_rendimento);`
  - Tabela `irpf_pagamentos_deducoes`:
    - `id`: UUID (Chave primária)
    - `contribuinte_id`: UUID (FK referenciando contribuinte)
    - `exercicio`: INTEGER (Ano-calendário do exercício fiscal)
    - `categoria_deducao`: VARCHAR(40) (`MEDICA`, `EDUCACAO`, `PREVIDENCIA_OFICIAL`, `PREVIDENCIA_COMPLEMENTAR`, `PENSAO_ALIMENTICIA`, `DOACAO`, `OUTRAS_DESPESAS`)
    - `beneficiario_tipo`: VARCHAR(20) (`TITULAR`, `DEPENDENTE`, `ALIMENTANDO`)
    - `beneficiario_id`: UUID (Opcional)
    - `favorecido_documento`: VARCHAR(18) (CPF ou CNPJ do prestador/favorecido)
    - `favorecido_nome`: VARCHAR(255)
    - `descricao`: TEXT (Opcional)
    - `valor_pago`: NUMERIC(15,2) (Restrição: `CHECK (valor_pago >= 0)`)
    - `parcela_nao_dedutivel_reembolso`: NUMERIC(15,2) (Padrão 0.00, `CHECK >= 0`)
    - `origem_dado`: VARCHAR(20) (`MANUAL`, `IMPORTADO`)
    - `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE
    - Índice: `CREATE INDEX idx_irpf_pagamentos_exercicio ON irpf_pagamentos_deducoes (contribuinte_id, exercicio, categoria_deducao);`
- **Rotas e Endpoints (REST API):**
  - `POST /api/irpf/:contribuinteId/rendimentos` - Criação de registro de rendimento
  - `GET /api/irpf/:contribuinteId/rendimentos?exercicio=:ano` - Consulta de rendimentos por exercício e tipo
  - `DELETE /api/irpf/:contribuinteId/rendimentos/:id` - Exclusão de rendimento
  - `POST /api/irpf/:contribuinteId/pagamentos` - Criação de registro de despesa dedutível
  - `GET /api/irpf/:contribuinteId/pagamentos?exercicio=:ano` - Consulta de pagamentos por exercício e categoria
  - `DELETE /api/irpf/:contribuinteId/pagamentos/:id` - Exclusão de pagamento dedutível
- **Regras e Validações:**
  - Validação de entrada via schemas Zod, bloqueando valores negativos e campos obrigatórios ausentes.
  - Restrição de consistência garantindo que registros pertençam unicamente ao contribuinte e exercício informados.

## 7. Tarefas de implementação
- [x] Criar branch de trabalho no padrão oficial (`spec/3.14-rendimentos-deducoes`)
- [x] Elaborar a especificação `SPEC-3.14.md` na pasta `specs/item-3-fiscal-ir/`
- [x] Atualizar `CHANGELOG.md` na seção `[Não lançado]`
- [x] Criar migração de banco de dados para criação das tabelas `irpf_rendimentos` e `irpf_pagamentos_deducoes` com índices e constraints
- [x] Implementar schemas Zod para validação dos dados de entrada de rendimentos e despesas dedutíveis
- [x] Implementar serviço e repositório para coleta e persistência de rendimentos por tipo (RF-031)
- [x] Implementar serviço e repositório para registro de despesas dedutíveis por exercício (RF-033)
- [x] Implementar controladores e rotas REST para CRUD e listagem por exercício
- [x] Criar testes unitários cobrindo validações de esquemas, tipos permitidos e valores monetários não negativos
- [x] Criar testes de integração validando os critérios de aceite (CA-1 a CA-5)
- [ ] Submeter Pull Request e aguardar revisão do 4º período

## 8. Dependências
- `SPEC-1.1` (Padrões de contribuição e estrutura de governança)
- `SPEC-1.2` (Arquitetura, stack Node.js/TypeScript e banco de dados PostgreSQL)
- Cadastro de contribuintes e dependentes (`RF-030`)

## 9. Como validar
1. **Validação do Registro de Rendimentos por Tipo (CA-1):**
   - Executar chamada POST para `/api/irpf/:contribuinteId/rendimentos` com tipo `TRIBUTAVEL_PJ`, exercício `2025`, documento da fonte pagadora e valor de R$ 5.000,00.
   - Verificar retorno HTTP 201 e conferir a persistência com o tipo correto e exercício vinculado.
   - Repetir para os tipos `ISENTO_NAO_TRIBUTAVEL`, `TRIBUTACAO_EXCLUSIVA`, `RECEBIDO_ACUMULADAMENTE` e `EXTERIOR`.
2. **Validação do Registro de Despesas Dedutíveis (CA-2):**
   - Executar chamada POST para `/api/irpf/:contribuinteId/pagamentos` com categoria `MEDICA`, exercício `2025`, dados do prestador e valor de R$ 1.500,00.
   - Verificar retorno HTTP 201 e checar a gravação associada ao exercício.
   - Repetir para categorias `EDUCACAO`, `PREVIDENCIA_OFICIAL`, `PENSAO_ALIMENTICIA` e `DOACAO`.
3. **Validação da Segregação por Exercício Fiscal (CA-3):**
   - Inserir registros nos exercícios `2024` e `2025`.
   - Executar GET filtrando por `?exercicio=2025` e validar que apenas dados referentes a 2025 são exibidos, devidamente agrupados por tipo/categoria.
4. **Validação de Bloqueio de Inconsistências (CA-4):**
   - Tentar cadastrar rendimento ou despesa com valor monetário negativo (`-250.00`) ou sem informar tipo/categoria.
   - Verificar que a requisição é rejeitada com código HTTP 400 e mensagem explicativa de validação.
5. **Validação da Rastreabilidade da Origem (CA-5):**
   - Inspecionar os registros criados e confirmar o preenchimento do campo `origem_dado` (`MANUAL` ou `IMPORTADO`) e o registro de data/hora (`created_at`).

## 10. Evidências (preencher ao concluir)
Execução da suíte completa de testes automatizados unitários e de integração (`npm test`):
```text
> node --import tsx --test "test/**/*.test.ts"

▶ API REST: Módulo IRPF (SPEC-3.14)
  ▶ Endpoints de Rendimentos (RF-031, CA-1, CA-3, CA-4)
    ✔ POST /api/irpf/:contribuinteId/rendimentos - deve cadastrar rendimento com sucesso (HTTP 201)
    ✔ POST /api/irpf/:contribuinteId/rendimentos - deve retornar HTTP 400 em caso de valor negativo (CA-4)
    ✔ GET /api/irpf/:contribuinteId/rendimentos?exercicio=2025 - deve listar rendimentos agrupados por tipo (CA-1, CA-3)
    ✔ DELETE /api/irpf/:contribuinteId/rendimentos/:id - deve excluir rendimento com sucesso
  ✔ Endpoints de Rendimentos (RF-031, CA-1, CA-3, CA-4)
  ▶ Endpoints de Pagamentos e Deduções (RF-033, CA-2, CA-3, CA-4)
    ✔ POST /api/irpf/:contribuinteId/pagamentos - deve cadastrar despesa dedutível com sucesso (HTTP 201)
    ✔ POST /api/irpf/:contribuinteId/pagamentos - deve rejeitar requisição sem favorecido (CA-4)
    ✔ GET /api/irpf/:contribuinteId/pagamentos?exercicio=2025 - deve listar pagamentos agrupados por categoria (CA-2, CA-3)
    ✔ DELETE /api/irpf/:contribuinteId/pagamentos/:id - deve excluir despesa dedutível com sucesso
  ✔ Endpoints de Pagamentos e Deduções (RF-033, CA-2, CA-3, CA-4)
✔ API REST: Módulo IRPF (SPEC-3.14)
▶ SPEC-3.14: Rendimentos e Deduções do IRPF
  ▶ CA-1: Registro de rendimentos por tipo e exercício (RF-031)
    ✔ deve registrar com sucesso rendimento tributável de pessoa jurídica
    ✔ deve registrar todos os tipos oficiais de rendimento previstos na legislação
  ✔ CA-1: Registro de rendimentos por tipo e exercício (RF-031)
  ▶ CA-2: Registro de despesas dedutíveis e pagamentos por exercício (RF-033)
    ✔ deve registrar com sucesso despesa médica vinculada ao exercício
    ✔ deve registrar todas as categorias oficiais de despesas dedutíveis (educação, previdência, pensão, doação)
  ✔ CA-2: Registro de despesas dedutíveis e pagamentos por exercício (RF-033)
  ▶ CA-3: Segregação e consulta por exercício fiscal
    ✔ deve retornar exclusivamente os rendimentos do exercício consultado com subtotais corretos
    ✔ deve retornar exclusivamente as despesas dedutíveis do exercício com subtotais por categoria
  ✔ CA-3: Segregação e consulta por exercício fiscal
  ▶ CA-4: Validação de campos obrigatórios e valores não negativos
    ✔ deve rejeitar rendimento com valor negativo
    ✔ deve rejeitar rendimento sem fonte pagadora ou documento
    ✔ deve rejeitar pagamento com valor pago negativo
    ✔ deve rejeitar categoria de dedução inválida
  ✔ CA-4: Validação de campos obrigatórios e valores não negativos
  ▶ CA-5: Rastreabilidade e origem dos dados (RB-005)
    ✔ deve registrar procedência MANUAL por padrão com carimbos de data/hora
    ✔ deve registrar procedência IMPORTADO quando indicado na integração
  ✔ CA-5: Rastreabilidade e origem dos dados (RB-005)
  ▶ Exclusão de lançamentos
    ✔ deve excluir rendimento existente com sucesso
    ✔ deve excluir pagamento dedutível existente com sucesso
  ✔ Exclusão de lançamentos
✔ SPEC-3.14: Rendimentos e Deduções do IRPF
ℹ tests 22
ℹ suites 10
ℹ pass 22
ℹ fail 0
```

## 11. Histórico de revisão
*Nenhuma ressalva registrada até o momento.*
