-- =====================================================
-- ADESIAP MINAS — Tabela de Denúncias e Ouvidoria
-- Execute no Supabase → SQL Editor → New query
-- =====================================================

CREATE TABLE IF NOT EXISTS denuncias (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo    text        UNIQUE NOT NULL,
  tipo         text        NOT NULL,
  dados        jsonb       NOT NULL DEFAULT '{}',
  email_usuario text,
  nome_usuario  text,
  status       text        NOT NULL DEFAULT 'Em análise',
  resposta_admin text,
  atualizado_em timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_denuncias_protocolo ON denuncias (protocolo);
CREATE INDEX IF NOT EXISTS idx_denuncias_status    ON denuncias (status);
CREATE INDEX IF NOT EXISTS idx_denuncias_tipo      ON denuncias (tipo);
CREATE INDEX IF NOT EXISTS idx_denuncias_created   ON denuncias (created_at DESC);

-- RLS
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_denuncias" ON denuncias;
DROP POLICY IF EXISTS "anon_select_denuncias" ON denuncias;
DROP POLICY IF EXISTS "anon_update_denuncias" ON denuncias;

CREATE POLICY "anon_insert_denuncias" ON denuncias
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_denuncias" ON denuncias
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_update_denuncias" ON denuncias
  FOR UPDATE TO anon USING (true);

-- Verificação
SELECT 'Tabela denuncias criada com sucesso' AS resultado;
