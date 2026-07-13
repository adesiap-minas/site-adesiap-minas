-- ============================================================
-- Tabela para registros persistentes de arquivos enviados via UI
-- Rodar no SQL Editor do Supabase (projeto adesiap)
-- ============================================================

CREATE TABLE IF NOT EXISTS sp_files (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prj_codigo  TEXT NOT NULL,
    trf_codigo  TEXT NOT NULL,
    doc_type    TEXT NOT NULL CHECK (doc_type IN ('cotacao', 'nf', 'certidao')),
    file_name   TEXT NOT NULL,
    web_url     TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (prj_codigo, trf_codigo, doc_type, file_name)
);

ALTER TABLE sp_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sp_files_all" ON sp_files;
CREATE POLICY "sp_files_all" ON sp_files
    USING (true) WITH CHECK (true);
