-- =====================================================
-- ADESIAP — Correção das políticas RLS da tabela configuracoes
-- Problema: o usuário anon não tem permissão de UPDATE/INSERT
-- Solução: substituir as políticas restritivas por políticas
--          que permitem leitura e escrita com a anon key
--
-- EXECUTAR NO SUPABASE: Dashboard → SQL Editor → New query
-- =====================================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "admin_all_configuracoes"    ON configuracoes;
DROP POLICY IF EXISTS "publico_select_whatsapp"    ON configuracoes;

-- 2. Leitura: qualquer um pode ler todas as configurações
--    (o painel admin precisa carregar e-mail, site, ouvidoria, etc.)
CREATE POLICY "allow_select_all" ON configuracoes
    FOR SELECT USING (true);

-- 3. Inserção: qualquer um pode inserir novas chaves
--    (necessário na primeira configuração)
CREATE POLICY "allow_insert_all" ON configuracoes
    FOR INSERT WITH CHECK (true);

-- 4. Atualização: qualquer um pode atualizar valores existentes
--    (necessário para "Salvar" no admin)
CREATE POLICY "allow_update_all" ON configuracoes
    FOR UPDATE USING (true) WITH CHECK (true);

-- Nota: DELETE não é habilitado — ninguém pode excluir chaves de config.
-- A "segurança" do painel é garantida pela senha client-side (localStorage).
-- =====================================================
