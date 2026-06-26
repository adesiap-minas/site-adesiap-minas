-- =====================================================
-- ADESIAP — Roteamento de E-mails por Formulário
-- Executar no Supabase: SQL Editor → New query
-- =====================================================

INSERT INTO configuracoes (chave, valor, descricao, grupo, sensivel) VALUES
    ('email_contato',             'comercial@adesiap.org.br',  'Destinatário do Fale Conosco',                  'email_routing', false),
    ('email_fornecedores',        'comercial@adesiap.org.br',  'Destinatário do Cadastro de Fornecedores',      'email_routing', false),
    ('email_ouvidoria_reclamacao','comercial@adesiap.org.br',  'Destinatário das Reclamações (Ouvidoria)',      'email_routing', false),
    ('email_ouvidoria_sugestao',  'comercial@adesiap.org.br',  'Destinatário das Sugestões (Ouvidoria)',        'email_routing', false),
    ('email_ouvidoria_elogio',    'comercial@adesiap.org.br',  'Destinatário dos Elogios (Ouvidoria)',          'email_routing', false),
    ('email_denuncias',           'comercial@adesiap.org.br',  'Destinatário do Canal de Denúncias (sigiloso)', 'email_routing', false),
    ('email_candidaturas',        'comercial@adesiap.org.br',  'Destinatário do Trabalhe Conosco (RH)',         'email_routing', false)
ON CONFLICT (chave) DO NOTHING;
