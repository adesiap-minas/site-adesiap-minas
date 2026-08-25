-- Portal de Transparência — tabela de documentos
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS documentos_transparencia (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    tab         text        NOT NULL CHECK (tab IN ('inst','contas','relatorios','editais','parcerias','mural')),
    year        int,
    title       text        NOT NULL,
    descritivo  text,
    filename    text        NOT NULL,
    sp_url      text        NOT NULL,
    sort_order  int         DEFAULT 0,
    active      boolean     DEFAULT true,
    created_at  timestamptz DEFAULT now()
);

-- Se a tabela já existe (criada sem descritivo), adicione a coluna:
-- ALTER TABLE documentos_transparencia ADD COLUMN IF NOT EXISTS descritivo text;

ALTER TABLE documentos_transparencia ENABLE ROW LEVEL SECURITY;

-- Público lê apenas documentos ativos
CREATE POLICY "public_read" ON documentos_transparencia
    FOR SELECT USING (active = true);

-- Índice para leitura pública (tab + year + sort)
CREATE INDEX IF NOT EXISTS idx_doct_tab_year
    ON documentos_transparencia (tab, year DESC, sort_order, created_at DESC)
    WHERE active = true;
