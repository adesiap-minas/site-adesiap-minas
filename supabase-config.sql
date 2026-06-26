-- =====================================================
-- ADESIAP — Tabela de Configurações do Sistema
-- Executar no Supabase: SQL Editor → New query
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT,
    grupo TEXT DEFAULT 'geral',
    sensivel BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Somente usuários autenticados (admin) podem ler e alterar
CREATE POLICY "admin_all_configuracoes" ON configuracoes
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE TRIGGER configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Valores padrão
-- =====================================================
INSERT INTO configuracoes (chave, valor, descricao, grupo, sensivel) VALUES
    -- E-mail
    ('smtp_host',       'smtp.office365.com',        'Servidor SMTP',                        'email', false),
    ('smtp_port',       '587',                        'Porta SMTP',                           'email', false),
    ('smtp_user',       '',                           'Usuário SMTP (e-mail remetente)',       'email', true),
    ('smtp_pass',       '',                           'Senha do e-mail remetente',             'email', true),
    ('email_destino',   'comercial@adesiap.org.br',  'E-mail que recebe os formulários',      'email', false),
    ('email_remetente', 'ADESIAP Minas',              'Nome exibido no remetente dos e-mails', 'email', false),

    -- Site
    ('site_nome',       'ADESIAP Minas',              'Nome do site',                          'site', false),
    ('site_url',        'https://adesiap.org.br',     'URL do site em produção',               'site', false),

    -- Ouvidoria
    ('ouvidoria_prazo', '15',                         'Prazo de resposta da ouvidoria (dias)', 'ouvidoria', false),
    ('ouvidoria_email', 'comercial@adesiap.org.br',  'E-mail da ouvidoria',                   'ouvidoria', false),

    -- Admin
    ('admin_senha',     '',                           'Senha de acesso ao painel admin',       'admin', true)

ON CONFLICT (chave) DO NOTHING;
