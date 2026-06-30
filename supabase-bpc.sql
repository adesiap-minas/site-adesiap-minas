-- =====================================================
-- ADESIAP MINAS — Módulo BPC (Banco de Projetos Comercial)
-- Módulo independente — não altera tabelas existentes
-- Pode ser rodado múltiplas vezes (idempotente)
-- =====================================================

-- ── 1. TABELA: EIXOS ESTRATÉGICOS ─────────────────
CREATE TABLE IF NOT EXISTS eixos_bpc (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    nome        TEXT        NOT NULL,
    slug        TEXT        UNIQUE NOT NULL,
    descricao   TEXT,
    sub_eixos   JSONB       DEFAULT '[]',
    icone       TEXT        DEFAULT 'fas fa-folder',
    cor         TEXT        DEFAULT '#12395D',
    ordem       INTEGER     DEFAULT 0,
    ativo       BOOLEAN     DEFAULT TRUE
);

ALTER TABLE eixos_bpc ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_eixos_bpc' AND tablename = 'eixos_bpc') THEN
        EXECUTE 'CREATE POLICY "select_eixos_bpc" ON eixos_bpc FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_eixos_bpc' AND tablename = 'eixos_bpc') THEN
        EXECUTE 'CREATE POLICY "insert_eixos_bpc" ON eixos_bpc FOR INSERT WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_eixos_bpc' AND tablename = 'eixos_bpc') THEN
        EXECUTE 'CREATE POLICY "update_eixos_bpc" ON eixos_bpc FOR UPDATE USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'delete_eixos_bpc' AND tablename = 'eixos_bpc') THEN
        EXECUTE 'CREATE POLICY "delete_eixos_bpc" ON eixos_bpc FOR DELETE USING (true)';
    END IF;
END$$;

-- ── 2. TABELA: PROJETOS COMERCIAIS ────────────────
CREATE TABLE IF NOT EXISTS projetos_comerciais (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    -- Identificação
    codigo          TEXT        UNIQUE,                         -- BPC001, BPC002... (auto-gerado)
    nome            TEXT        NOT NULL,
    ano             INTEGER     DEFAULT EXTRACT(YEAR FROM NOW()),
    resumo          TEXT,
    descricao       TEXT,
    observacoes     TEXT,
    responsavel     TEXT,

    -- Classificação
    eixo_id             UUID    REFERENCES eixos_bpc(id),
    eixo_secundario_id  UUID    REFERENCES eixos_bpc(id),
    sub_eixos           TEXT[]  DEFAULT '{}',
    areas_tematicas     TEXT[]  DEFAULT '{}',

    -- Público e Território
    publico_alvo    TEXT,
    municipio       TEXT,
    estado          TEXT        DEFAULT 'MG',
    escalonamento   TEXT        DEFAULT 'MUNICIPAL',            -- MUNICIPAL, REGIONAL, ESTADUAL, NACIONAL

    -- Pipeline comercial
    status_pipeline     TEXT    DEFAULT 'IDEIA',
    -- IDEIA | EM DESENVOLVIMENTO | EM ESTRUTURAÇÃO | EM REVISÃO | PRONTO PARA CAPTAÇÃO | CAPTADO/EM EXECUÇÃO | NÃO APROVADO
    situacao_comercial  TEXT    DEFAULT 'NUNCA APRESENTADO',
    -- EM NEGOCIAÇÃO | NUNCA APRESENTADO | A DEFINIR | APROVADO | APRESENTADO

    -- Financeiro
    valor_estimado  NUMERIC(15,2),

    -- Características do projeto
    possui_projeto_completo BOOLEAN DEFAULT FALSE,
    replicabilidade         TEXT    DEFAULT 'MÉDIA',            -- ALTA, MÉDIA, BAIXA
    necessidade_adaptacao   TEXT    DEFAULT 'MÉDIA',            -- ALTA, MÉDIA, BAIXA, NÃO

    -- ODS
    ods                 INTEGER[]   DEFAULT '{}',
    contribuicao_ods    TEXT,

    -- Documentos (links SharePoint — manual por enquanto)
    documentos  JSONB   DEFAULT '[]',
    -- formato: [{ "nome": "Plano de Trabalho", "url": "https://...", "categoria": "01-Plano de Trabalho", "data": "2026-01-01" }]

    -- Publicação pública (página captacao.html)
    publicar_captacao   BOOLEAN DEFAULT FALSE,
    destaque_captacao   BOOLEAN DEFAULT FALSE,

    -- Integração opcional com projeto institucional (sem FK para manter independência)
    projeto_institucional_id UUID,

    -- ── Maturidade: 10 critérios ──────────────────
    mat_diagnostico         BOOLEAN DEFAULT FALSE,
    mat_justificativa       BOOLEAN DEFAULT FALSE,
    mat_objetivos           BOOLEAN DEFAULT FALSE,
    mat_metas               BOOLEAN DEFAULT FALSE,
    mat_indicadores         BOOLEAN DEFAULT FALSE,
    mat_metodologia         BOOLEAN DEFAULT FALSE,
    mat_cronograma          BOOLEAN DEFAULT FALSE,
    mat_orcamento           BOOLEAN DEFAULT FALSE,
    mat_plano_trabalho      BOOLEAN DEFAULT FALSE,
    mat_apresentacao        BOOLEAN DEFAULT FALSE,

    -- % calculada automaticamente (coluna gerada)
    maturidade_pct  INTEGER GENERATED ALWAYS AS (
        (CASE WHEN mat_diagnostico      THEN 10 ELSE 0 END +
         CASE WHEN mat_justificativa    THEN 10 ELSE 0 END +
         CASE WHEN mat_objetivos        THEN 10 ELSE 0 END +
         CASE WHEN mat_metas            THEN 10 ELSE 0 END +
         CASE WHEN mat_indicadores      THEN 10 ELSE 0 END +
         CASE WHEN mat_metodologia      THEN 10 ELSE 0 END +
         CASE WHEN mat_cronograma       THEN 10 ELSE 0 END +
         CASE WHEN mat_orcamento        THEN 10 ELSE 0 END +
         CASE WHEN mat_plano_trabalho   THEN 10 ELSE 0 END +
         CASE WHEN mat_apresentacao     THEN 10 ELSE 0 END)
    ) STORED
);

ALTER TABLE projetos_comerciais ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_projetos_comerciais' AND tablename = 'projetos_comerciais') THEN
        EXECUTE 'CREATE POLICY "select_projetos_comerciais" ON projetos_comerciais FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_projetos_comerciais' AND tablename = 'projetos_comerciais') THEN
        EXECUTE 'CREATE POLICY "insert_projetos_comerciais" ON projetos_comerciais FOR INSERT WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_projetos_comerciais' AND tablename = 'projetos_comerciais') THEN
        EXECUTE 'CREATE POLICY "update_projetos_comerciais" ON projetos_comerciais FOR UPDATE USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'delete_projetos_comerciais' AND tablename = 'projetos_comerciais') THEN
        EXECUTE 'CREATE POLICY "delete_projetos_comerciais" ON projetos_comerciais FOR DELETE USING (true)';
    END IF;
END$$;

-- ── 3. TABELA: DIÁRIO DO PROJETO ──────────────────
CREATE TABLE IF NOT EXISTS diario_bpc (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    projeto_id  UUID        NOT NULL REFERENCES projetos_comerciais(id) ON DELETE CASCADE,
    tipo        TEXT        DEFAULT 'manual',   -- 'manual' | 'automatico'
    usuario     TEXT,
    mensagem    TEXT        NOT NULL,
    campo_alterado  TEXT,                       -- preenchido só nas entradas automáticas
    valor_anterior  TEXT,
    valor_novo      TEXT
);

ALTER TABLE diario_bpc ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_diario_bpc' AND tablename = 'diario_bpc') THEN
        EXECUTE 'CREATE POLICY "select_diario_bpc" ON diario_bpc FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_diario_bpc' AND tablename = 'diario_bpc') THEN
        EXECUTE 'CREATE POLICY "insert_diario_bpc" ON diario_bpc FOR INSERT WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_diario_bpc' AND tablename = 'diario_bpc') THEN
        EXECUTE 'CREATE POLICY "update_diario_bpc" ON diario_bpc FOR UPDATE USING (true) WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'delete_diario_bpc' AND tablename = 'diario_bpc') THEN
        EXECUTE 'CREATE POLICY "delete_diario_bpc" ON diario_bpc FOR DELETE USING (true)';
    END IF;
END$$;

-- ── 4. SEQUENCE: CÓDIGO BPC ───────────────────────
CREATE SEQUENCE IF NOT EXISTS bpc_codigo_seq START 1;

-- ── 5. TRIGGER: AUTO-GERAR CÓDIGO BPC ────────────
CREATE OR REPLACE FUNCTION fn_gerar_codigo_bpc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := 'BPC' || LPAD(nextval('bpc_codigo_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gerar_codigo_bpc ON projetos_comerciais;
CREATE TRIGGER trg_gerar_codigo_bpc
    BEFORE INSERT ON projetos_comerciais
    FOR EACH ROW EXECUTE FUNCTION fn_gerar_codigo_bpc();

-- ── 6. TRIGGER: ATUALIZAR updated_at ─────────────
CREATE OR REPLACE FUNCTION fn_updated_at_bpc()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_updated_at_bpc ON projetos_comerciais;
CREATE TRIGGER trg_updated_at_bpc
    BEFORE UPDATE ON projetos_comerciais
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at_bpc();

-- ── 7. TRIGGER: DIÁRIO AUTOMÁTICO (INSERT) ────────
CREATE OR REPLACE FUNCTION fn_diario_insert_bpc()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO diario_bpc (projeto_id, tipo, mensagem)
    VALUES (
        NEW.id,
        'automatico',
        'Projeto ' || NEW.codigo || ' criado com status "' || NEW.status_pipeline || '".'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_diario_insert_bpc ON projetos_comerciais;
CREATE TRIGGER trg_diario_insert_bpc
    AFTER INSERT ON projetos_comerciais
    FOR EACH ROW EXECUTE FUNCTION fn_diario_insert_bpc();

-- ── 8. TRIGGER: DIÁRIO AUTOMÁTICO (UPDATE) ────────
CREATE OR REPLACE FUNCTION fn_diario_update_bpc()
RETURNS TRIGGER AS $$
BEGIN
    -- Status pipeline
    IF OLD.status_pipeline IS DISTINCT FROM NEW.status_pipeline THEN
        INSERT INTO diario_bpc (projeto_id, tipo, mensagem, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'automatico',
            'Status alterado: "' || COALESCE(OLD.status_pipeline,'—') || '" → "' || NEW.status_pipeline || '".',
            'status_pipeline', OLD.status_pipeline, NEW.status_pipeline);
    END IF;

    -- Situação comercial
    IF OLD.situacao_comercial IS DISTINCT FROM NEW.situacao_comercial THEN
        INSERT INTO diario_bpc (projeto_id, tipo, mensagem, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'automatico',
            'Situação comercial: "' || COALESCE(OLD.situacao_comercial,'—') || '" → "' || NEW.situacao_comercial || '".',
            'situacao_comercial', OLD.situacao_comercial, NEW.situacao_comercial);
    END IF;

    -- Valor estimado
    IF OLD.valor_estimado IS DISTINCT FROM NEW.valor_estimado THEN
        INSERT INTO diario_bpc (projeto_id, tipo, mensagem, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'automatico',
            'Valor estimado: R$ ' || COALESCE(OLD.valor_estimado::TEXT,'—') || ' → R$ ' || COALESCE(NEW.valor_estimado::TEXT,'—') || '.',
            'valor_estimado', OLD.valor_estimado::TEXT, NEW.valor_estimado::TEXT);
    END IF;

    -- Maturidade (qualquer critério alterado)
    IF (OLD.mat_diagnostico, OLD.mat_justificativa, OLD.mat_objetivos, OLD.mat_metas, OLD.mat_indicadores,
        OLD.mat_metodologia, OLD.mat_cronograma, OLD.mat_orcamento, OLD.mat_plano_trabalho, OLD.mat_apresentacao)
    IS DISTINCT FROM
       (NEW.mat_diagnostico, NEW.mat_justificativa, NEW.mat_objetivos, NEW.mat_metas, NEW.mat_indicadores,
        NEW.mat_metodologia, NEW.mat_cronograma, NEW.mat_orcamento, NEW.mat_plano_trabalho, NEW.mat_apresentacao)
    THEN
        INSERT INTO diario_bpc (projeto_id, tipo, mensagem, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'automatico',
            'Maturidade atualizada.',
            'maturidade', NULL, NULL);
    END IF;

    -- Publicar na captação
    IF OLD.publicar_captacao IS DISTINCT FROM NEW.publicar_captacao THEN
        INSERT INTO diario_bpc (projeto_id, tipo, mensagem, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, 'automatico',
            CASE WHEN NEW.publicar_captacao
                THEN 'Projeto publicado na página de captação.'
                ELSE 'Projeto removido da página de captação.'
            END,
            'publicar_captacao', OLD.publicar_captacao::TEXT, NEW.publicar_captacao::TEXT);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_diario_update_bpc ON projetos_comerciais;
CREATE TRIGGER trg_diario_update_bpc
    AFTER UPDATE ON projetos_comerciais
    FOR EACH ROW EXECUTE FUNCTION fn_diario_update_bpc();

-- ── 9. SEED: 14 EIXOS ESTRATÉGICOS ───────────────
INSERT INTO eixos_bpc (nome, slug, icone, cor, sub_eixos, ordem) VALUES
('Desenvolvimento Social',              'desenvolvimento-social',   'fas fa-hands-helping',    '#E63946',
 '["Vulnerabilidade social","Assistência social","Fortalecimento comunitário","Proteção social","Direitos humanos"]', 1),

('Saúde',                               'saude',                    'fas fa-heartbeat',        '#E76F51',
 '["Promoção da saúde","Prevenção","Saúde mental","Saúde da mulher","Saúde do idoso"]', 2),

('Educação',                            'educacao',                 'fas fa-graduation-cap',   '#2A9D8F',
 '["Educação formal","Reforço escolar","Educação complementar","Educação ambiental","Educação financeira"]', 3),

('Meio Ambiente',                       'meio-ambiente',            'fas fa-tree',             '#3B8C6E',
 '["Recuperação ambiental","Recursos hídricos","Resíduos sólidos","Conservação"]', 4),

('Sustentabilidade',                    'sustentabilidade',         'fas fa-leaf',             '#57A773',
 '["ESG","Economia circular","Consumo consciente","Desenvolvimento sustentável"]', 5),

('Desenvolvimento Econômico',           'desenvolvimento-economico','fas fa-chart-line',       '#12395D',
 '["Geração de renda","Empreendedorismo","Qualificação profissional","Inclusão produtiva"]', 6),

('Cultura',                             'cultura',                  'fas fa-palette',          '#D9902F',
 '["Artes","Patrimônio","Música","Dança","Eventos culturais"]', 7),

('Esporte',                             'esporte',                  'fas fa-running',          '#C1121F',
 '["Esporte educacional","Esporte de rendimento","Lazer"]', 8),

('Tecnologia e Inovação',               'tecnologia-inovacao',      'fas fa-microchip',        '#264653',
 '["Inclusão digital","Robótica","Inteligência Artificial","Transformação digital","Capacitação tecnológica"]', 9),

('Infraestrutura',                      'infraestrutura',           'fas fa-hard-hat',         '#5F6B76',
 '["Obras","Equipamentos","Reforma","Construção","Urbanização"]', 10),

('Mobilidade Urbana',                   'mobilidade-urbana',        'fas fa-road',             '#2A9D8F',
 '["Trânsito","Acessibilidade","Transporte","Ciclomobilidade"]', 11),

('Agricultura e Desenvolvimento Rural', 'agricultura',              'fas fa-seedling',         '#6A994E',
 '["Agricultura familiar","Segurança alimentar","Agroecologia","Desenvolvimento rural"]', 12),

('Direitos e Inclusão',                 'direitos-inclusao',        'fas fa-balance-scale',    '#B5838D',
 '["Mulheres","Juventude","Idosos","Pessoas com deficiência","Igualdade racial","Diversidade"]', 13),

('Defesa Civil e Gestão de Riscos',     'defesa-civil',             'fas fa-shield-alt',       '#6C757D',
 '["Resposta a desastres","Prevenção","Resiliência comunitária","Emergências"]', 14)

ON CONFLICT (slug) DO NOTHING;

-- ── VERIFICAÇÃO ───────────────────────────────────
SELECT 'eixos_bpc'          AS tabela, COUNT(*) AS total FROM eixos_bpc
UNION ALL
SELECT 'projetos_comerciais' AS tabela, COUNT(*) AS total FROM projetos_comerciais
UNION ALL
SELECT 'diario_bpc'         AS tabela, COUNT(*) AS total FROM diario_bpc;
