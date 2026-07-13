-- ============================================================
-- Tabelas para integração SharePoint — documentação de projetos
-- Rodar no SQL Editor do Supabase (projeto adesiap)
-- ============================================================

-- Mapeia código do projeto TOTVS → nome da pasta no SharePoint
-- Formato da pasta: "X - Nome do Projeto" (conforme Power Apps)
CREATE TABLE IF NOT EXISTS sp_project_config (
    prj_codigo TEXT PRIMARY KEY,
    sp_folder  TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sp_project_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sp_project_config_all" ON sp_project_config;
CREATE POLICY "sp_project_config_all" ON sp_project_config
    USING (true) WITH CHECK (true);


-- Justificativas para documentos ausentes (por tarefa + tipo de doc)
-- doc_type: 'cotacao' | 'nf' | 'certidao'
CREATE TABLE IF NOT EXISTS sp_justificativas (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prj_codigo TEXT NOT NULL,
    trf_codigo TEXT NOT NULL,
    doc_type   TEXT NOT NULL CHECK (doc_type IN ('cotacao', 'nf', 'certidao')),
    texto      TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (prj_codigo, trf_codigo, doc_type)
);

ALTER TABLE sp_justificativas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sp_justificativas_all" ON sp_justificativas;
CREATE POLICY "sp_justificativas_all" ON sp_justificativas
    USING (true) WITH CHECK (true);
