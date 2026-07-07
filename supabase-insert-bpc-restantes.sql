-- =====================================================
-- ADESIAP MINAS — BPC: Projetos restantes da planilha
-- Fonte: V1 Banco de Projetos Comercial.xlsx
--   Aba "INDICADOR BPCG" (dados gerais)
--   Aba "Maturidade %" (critérios de maturidade)
--
-- IMPORTANTE: Apenas dados extraídos da planilha.
-- Campos sem valor na planilha = NULL (não inventados).
--
-- Execute no Supabase → SQL Editor → New query
-- Idempotente: ON CONFLICT (codigo) DO NOTHING
-- =====================================================

-- ─────────────────────────────────────────────────────
-- PARTE 1: Corrige os códigos dos 5 projetos já inseridos
-- O trigger auto-gerou BPC001-BPC005 em ordem de inserção,
-- mas os códigos reais da planilha são BPC001,004,005,006,010.
-- ─────────────────────────────────────────────────────

-- Executar na ordem correta para não violar UNIQUE
UPDATE projetos_comerciais SET codigo = 'BPC010'
WHERE nome = 'FLORESCER — Fórum de Psicologia'
  AND codigo IS DISTINCT FROM 'BPC010';

UPDATE projetos_comerciais SET codigo = 'BPC006'
WHERE nome = 'Resposta a Desastres Ambientais'
  AND codigo IS DISTINCT FROM 'BPC006';

UPDATE projetos_comerciais SET codigo = 'BPC005'
WHERE nome = 'ECOEMPREENDE'
  AND codigo IS DISTINCT FROM 'BPC005';

UPDATE projetos_comerciais SET codigo = 'BPC004'
WHERE nome = 'CAMPE Financeiro'
  AND codigo IS DISTINCT FROM 'BPC004';

-- BPC001 (Água Limpa – Fase 01) já deve ter o código correto


-- ─────────────────────────────────────────────────────
-- PARTE 2: Insere os 17 projetos restantes
-- ─────────────────────────────────────────────────────

-- BPC002 — Água Limpa Sustentável - Fase 02
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC002', 'Água Limpa Sustentável - Fase 02', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'sustentabilidade'),
    ARRAY['Economia circular'], ARRAY['MEIO AMBIENTE'],
    'MUNICIPAL',
    'EM DESENVOLVIMENTO', 'NUNCA APRESENTADO',
    FALSE, 'MÉDIA', 'BAIXA',
    TRUE, TRUE, TRUE, FALSE,
    FALSE, FALSE, FALSE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC003 — Água Limpa Sustentável - Fase 03
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC003', 'Água Limpa Sustentável - Fase 03', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'sustentabilidade'),
    ARRAY['Economia circular'], ARRAY['MEIO AMBIENTE'],
    'MUNICIPAL',
    'EM DESENVOLVIMENTO', 'NUNCA APRESENTADO',
    FALSE, 'MÉDIA', 'BAIXA',
    TRUE, TRUE, TRUE, FALSE,
    FALSE, FALSE, FALSE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC007 — SÓ POR HOJE
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos,
    status_pipeline, situacao_comercial,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC007', 'SÓ POR HOJE', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'desenvolvimento-social'),
    ARRAY['Prevenção'],
    'PRONTO PARA CAPTAÇÃO', 'APRESENTADO',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC008 — CORRIDA SÓ POR HOJE
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    valor_estimado,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC008', 'CORRIDA SÓ POR HOJE', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'esporte'),
    ARRAY['Vulnerabilidade social'], ARRAY['DESENVOLVIMENTO SOCIAL'],
    'MUNICIPAL',
    'PRONTO PARA CAPTAÇÃO', 'APRESENTADO',
    150000.00,
    TRUE, 'ALTA', 'BAIXA',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, TRUE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC009 — TAMO JUNTO E QUALIFICADO
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    valor_estimado,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC009', 'TAMO JUNTO E QUALIFICADO', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'direitos-inclusao'),
    ARRAY['Reintegração social'], ARRAY['DESENVOLVIMENTO SOCIAL'],
    'MUNICIPAL',
    'PRONTO PARA CAPTAÇÃO', 'APRESENTADO',
    149536.62,
    TRUE, 'ALTA', 'MÉDIA',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC011 — SEMANA DE DESENVOLVIMENTO ECONÔMICO
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    valor_estimado,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC011', 'SEMANA DE DESENVOLVIMENTO ECONÔMICO', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'sustentabilidade'),
    ARRAY['Geração de renda'], ARRAY['DESENVOLVIMENTO ECONÔMICO'],
    'MUNICIPAL',
    'PRONTO PARA CAPTAÇÃO', 'EM NEGOCIAÇÃO',
    2000000.00,
    TRUE, 'ALTA', 'BAIXA',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC012 — POLÍCIA CIVIL ITABIRITO
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    valor_estimado,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC012', 'POLÍCIA CIVIL ITABIRITO', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'tecnologia-inovacao'),
    ARRAY['Prevenção'], ARRAY['MEIO AMBIENTE'],
    'MUNICIPAL',
    'CAPTADO/EM EXECUÇÃO', 'APROVADO',
    267300.00,
    TRUE, 'ALTA', 'ALTA',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC013 — FORTALECIMENTO DO ATENDIMENTO MULTIDISCIPLINAR EQUOTERAPIA PMMG
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    valor_estimado,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC013', 'FORTALECIMENTO DO ATENDIMENTO MULTIDISCIPLINAR EQUOTERAPIA PMMG', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'direitos-inclusao'),
    ARRAY['Promoção da saúde'], ARRAY['SAÚDE'],
    'ESTADUAL',
    'PRONTO PARA CAPTAÇÃO', 'EM NEGOCIAÇÃO',
    651300.00,
    TRUE, 'BAIXA', 'ALTA',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC014 — SUSTENTAÇÃO OPERACIONAL E ADMINISTRATIVA EQUOTERAPIA PMMG
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    valor_estimado,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC014', 'SUSTENTAÇÃO OPERACIONAL E ADMINISTRATIVA EQUOTERAPIA PMMG', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'direitos-inclusao'),
    ARRAY['Promoção da saúde'], ARRAY['SAÚDE'],
    'ESTADUAL',
    'PRONTO PARA CAPTAÇÃO', 'EM NEGOCIAÇÃO',
    570512.24,
    TRUE, 'BAIXA', 'ALTA',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC015 — ESTRUTURAÇÃO DA EQUIPE OPERACIONAL EQUOTERAPIA PMMG
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    eixo_id, sub_eixos, areas_tematicas,
    escalonamento,
    status_pipeline, situacao_comercial,
    possui_projeto_completo, replicabilidade, necessidade_adaptacao,
    mat_diagnostico, mat_justificativa, mat_objetivos, mat_metas,
    mat_indicadores, mat_cronograma, mat_orcamento, mat_apresentacao
) VALUES (
    'BPC015', 'ESTRUTURAÇÃO DA EQUIPE OPERACIONAL EQUOTERAPIA PMMG', 2026,
    (SELECT id FROM eixos_bpc WHERE slug = 'direitos-inclusao'),
    ARRAY['Promoção da saúde'], ARRAY['SAÚDE'],
    'ESTADUAL',
    'EM DESENVOLVIMENTO', 'NUNCA APRESENTADO',
    FALSE, 'BAIXA', 'ALTA',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, FALSE
) ON CONFLICT (codigo) DO NOTHING;

-- BPC016 — PROGRAMA MELIM - 1ª INFÂNCIA
-- (campos de classificação sem dados na planilha)
INSERT INTO projetos_comerciais (
    codigo, nome, ano
) VALUES (
    'BPC016', 'PROGRAMA MELIM - 1ª INFÂNCIA', 2026
) ON CONFLICT (codigo) DO NOTHING;

-- BPC017 — APOIO À GESTÃO, EXECUÇÃO E MONITORAMENTO DE PROJETOS NA PLATAFORMA SEMENTE DO MPMG
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    status_pipeline, situacao_comercial
) VALUES (
    'BPC017',
    'APOIO À GESTÃO, EXECUÇÃO E MONITORAMENTO DE PROJETOS NA PLATAFORMA SEMENTE DO MPMG',
    2026,
    'PRONTO PARA CAPTAÇÃO', 'NÃO APROVADO'
) ON CONFLICT (codigo) DO NOTHING;

-- BPC018 — TCCE SAMARCO
-- (sem dados de classificação na planilha)
INSERT INTO projetos_comerciais (
    codigo, nome, ano
) VALUES (
    'BPC018', 'TCCE SAMARCO', 2026
) ON CONFLICT (codigo) DO NOTHING;

-- BPC019 — SÃO JOSÉ ESPORTE CLUBE
-- (sem dados de classificação na planilha)
INSERT INTO projetos_comerciais (
    codigo, nome, ano
) VALUES (
    'BPC019', 'SÃO JOSÉ ESPORTE CLUBE', 2026
) ON CONFLICT (codigo) DO NOTHING;

-- BPC020 — MARKETPLACE CONGONHAS
-- (sem dados de classificação na planilha)
INSERT INTO projetos_comerciais (
    codigo, nome, ano
) VALUES (
    'BPC020', 'MARKETPLACE CONGONHAS', 2026
) ON CONFLICT (codigo) DO NOTHING;

-- BPC021 — NADAR E CORRER MARIANA
-- (sem dados de classificação na planilha)
INSERT INTO projetos_comerciais (
    codigo, nome, ano
) VALUES (
    'BPC021', 'NADAR E CORRER MARIANA', 2026
) ON CONFLICT (codigo) DO NOTHING;

-- BPC022 — MONITORAMENTO INTELIGENTE DO MUNICÍPIO DE CONCEIÇÃO DO PARÁ (FASE 01)
INSERT INTO projetos_comerciais (
    codigo, nome, ano,
    status_pipeline, situacao_comercial
) VALUES (
    'BPC022',
    'MONITORAMENTO INTELIGENTE DO MUNICÍPIO DE CONCEIÇÃO DO PARÁ (FASE 01)',
    2026,
    'PRONTO PARA CAPTAÇÃO', 'EM NEGOCIAÇÃO'
) ON CONFLICT (codigo) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- VERIFICAÇÃO
-- ─────────────────────────────────────────────────────
SELECT codigo, nome, status_pipeline, situacao_comercial,
       valor_estimado, maturidade_pct
FROM projetos_comerciais
ORDER BY codigo;
