-- ============================================================
-- RLS HARDENING — ADESIAP Admin
-- Execute no Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- ── 1. Função auxiliar: lê o perfil do JWT (app_metadata.perfil) ─────────────
CREATE OR REPLACE FUNCTION get_user_perfil()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'perfil';
$$;


-- ── 2. CONFIGURACOES ─────────────────────────────────────────────────────────
-- Leitura pública mantida (necessária para wa-config.js no frontend)
-- Escrita restrita a usuários autenticados (super_admin na prática via API)

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura_publica_cfg"        ON configuracoes;
DROP POLICY IF EXISTS "escrita_autenticada_cfg"     ON configuracoes;
DROP POLICY IF EXISTS "atualizacao_autenticada_cfg" ON configuracoes;

CREATE POLICY "leitura_publica_cfg"
  ON configuracoes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "escrita_autenticada_cfg"
  ON configuracoes FOR INSERT
  TO authenticated
  WITH CHECK (get_user_perfil() = 'super_admin');

CREATE POLICY "atualizacao_autenticada_cfg"
  ON configuracoes FOR UPDATE
  TO authenticated
  USING  (get_user_perfil() = 'super_admin')
  WITH CHECK (get_user_perfil() = 'super_admin');


-- ── 3. CONSELHOS ─────────────────────────────────────────────────────────────
-- Leitura pública (frontend exibe conselhos); escrita restrita a editor+

ALTER TABLE conselhos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura_publica_conselhos"   ON conselhos;
DROP POLICY IF EXISTS "escrita_editor_conselhos"     ON conselhos;
DROP POLICY IF EXISTS "edicao_editor_conselhos"      ON conselhos;
DROP POLICY IF EXISTS "exclusao_editor_conselhos"    ON conselhos;

CREATE POLICY "leitura_publica_conselhos"
  ON conselhos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "escrita_editor_conselhos"
  ON conselhos FOR INSERT
  TO authenticated
  WITH CHECK (get_user_perfil() IN ('super_admin','editor'));

CREATE POLICY "edicao_editor_conselhos"
  ON conselhos FOR UPDATE
  TO authenticated
  USING  (get_user_perfil() IN ('super_admin','editor'))
  WITH CHECK (get_user_perfil() IN ('super_admin','editor'));

CREATE POLICY "exclusao_editor_conselhos"
  ON conselhos FOR DELETE
  TO authenticated
  USING (get_user_perfil() IN ('super_admin','editor'));


-- ── 4. PROJETOS ──────────────────────────────────────────────────────────────
-- Leitura pública; escrita para editor e gestor_projetos

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura_publica_projetos"  ON projetos;
DROP POLICY IF EXISTS "escrita_editor_projetos"    ON projetos;
DROP POLICY IF EXISTS "edicao_editor_projetos"     ON projetos;
DROP POLICY IF EXISTS "exclusao_editor_projetos"   ON projetos;

CREATE POLICY "leitura_publica_projetos"
  ON projetos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "escrita_editor_projetos"
  ON projetos FOR INSERT
  TO authenticated
  WITH CHECK (get_user_perfil() IN ('super_admin','editor','gestor_projetos'));

CREATE POLICY "edicao_editor_projetos"
  ON projetos FOR UPDATE
  TO authenticated
  USING  (get_user_perfil() IN ('super_admin','editor','gestor_projetos'))
  WITH CHECK (get_user_perfil() IN ('super_admin','editor','gestor_projetos'));

CREATE POLICY "exclusao_editor_projetos"
  ON projetos FOR DELETE
  TO authenticated
  USING (get_user_perfil() IN ('super_admin','editor','gestor_projetos'));


-- ── 5. BANCO_PROJETOS_COMERCIAL (bpc) ────────────────────────────────────────

ALTER TABLE banco_projetos_comercial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura_bpc"   ON banco_projetos_comercial;
DROP POLICY IF EXISTS "escrita_bpc"   ON banco_projetos_comercial;
DROP POLICY IF EXISTS "edicao_bpc"    ON banco_projetos_comercial;
DROP POLICY IF EXISTS "exclusao_bpc"  ON banco_projetos_comercial;

CREATE POLICY "leitura_bpc"
  ON banco_projetos_comercial FOR SELECT
  TO authenticated
  USING (get_user_perfil() IN ('super_admin','gestor_projetos'));

CREATE POLICY "escrita_bpc"
  ON banco_projetos_comercial FOR INSERT
  TO authenticated
  WITH CHECK (get_user_perfil() IN ('super_admin','gestor_projetos'));

CREATE POLICY "edicao_bpc"
  ON banco_projetos_comercial FOR UPDATE
  TO authenticated
  USING  (get_user_perfil() IN ('super_admin','gestor_projetos'))
  WITH CHECK (get_user_perfil() IN ('super_admin','gestor_projetos'));

CREATE POLICY "exclusao_bpc"
  ON banco_projetos_comercial FOR DELETE
  TO authenticated
  USING (get_user_perfil() IN ('super_admin','gestor_projetos'));


-- ── 6. OUVIDORIA / DENUNCIAS ─────────────────────────────────────────────────
-- Inserção pública (formulário do site); leitura restrita à ouvidoria

ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insercao_publica_denuncia"  ON denuncias;
DROP POLICY IF EXISTS "leitura_ouvidoria_denuncia"  ON denuncias;

CREATE POLICY "insercao_publica_denuncia"
  ON denuncias FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "leitura_ouvidoria_denuncia"
  ON denuncias FOR SELECT
  TO authenticated
  USING (get_user_perfil() IN ('super_admin','ouvidoria_compliance'));


-- ── 7. PARCEIROS ─────────────────────────────────────────────────────────────
-- Inserção pública (formulário Seja Parceiro); leitura restrita

ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insercao_publica"     ON parceiros;
DROP POLICY IF EXISTS "leitura_autenticada"  ON parceiros;

CREATE POLICY "insercao_publica"
  ON parceiros FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "leitura_autenticada"
  ON parceiros FOR SELECT
  TO authenticated
  USING (get_user_perfil() IN ('super_admin','comercial_captacao','gestor_projetos'));


-- ── Verificação: lista políticas criadas ─────────────────────────────────────
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('configuracoes','conselhos','projetos','banco_projetos_comercial','denuncias','parceiros')
ORDER BY tablename, policyname;
