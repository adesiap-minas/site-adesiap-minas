-- =====================================================
-- ADESIAP — Configurações de WhatsApp
-- Executar no Supabase: SQL Editor → New query
-- =====================================================

INSERT INTO configuracoes (chave, valor, descricao, grupo, sensivel) VALUES

    -- TOPBAR (aparece em todas as páginas)
    ('wa_topbar_1_numero',  '553184271617',  'Topbar — Número 1 (CAMPE)',               'whatsapp', false),
    ('wa_topbar_1_label',   'CAMPE',         'Topbar — Rótulo 1',                       'whatsapp', false),
    ('wa_topbar_1_msg',     'Olá! Vim pelo site da ADESIAP Minas e gostaria de atendimento sobre o CAMPE.', 'Topbar — Mensagem 1', 'whatsapp', false),

    ('wa_topbar_2_numero',  '553196288671',  'Topbar — Número 2 (Só Por Hoje)',         'whatsapp', false),
    ('wa_topbar_2_label',   'SÓ POR HOJE',   'Topbar — Rótulo 2',                       'whatsapp', false),
    ('wa_topbar_2_msg',     'Olá! Vim pelo site da ADESIAP Minas e gostaria de atendimento sobre o Projeto Só Por Hoje.', 'Topbar — Mensagem 2', 'whatsapp', false),

    ('wa_topbar_3_numero',  '553184011390',  'Topbar — Número 3 (ADESIAP Geral)',       'whatsapp', false),
    ('wa_topbar_3_label',   'ADESIAP',       'Topbar — Rótulo 3',                       'whatsapp', false),
    ('wa_topbar_3_msg',     'Olá! Vim pelo site da ADESIAP Minas e gostaria de mais informações.', 'Topbar — Mensagem 3', 'whatsapp', false),

    -- CARD FALE CONOSCO
    ('wa_fale_conosco_numero', '553135631958', 'Card WhatsApp na página Fale Conosco',   'whatsapp', false),
    ('wa_fale_conosco_label',  '(31) 3563-1958', 'Número exibido no card',              'whatsapp', false),

    -- CTAs POR PÁGINA
    ('wa_cta_inicio_numero',      '553184011390', 'CTA Início (index.html)',             'whatsapp', false),
    ('wa_cta_inicio_msg',         'Olá! Vim pelo site da ADESIAP Minas e gostaria de mais informações.', 'CTA Início — mensagem', 'whatsapp', false),

    ('wa_cta_quem_somos_numero',  '553184011390', 'CTA Quem Somos',                     'whatsapp', false),
    ('wa_cta_quem_somos_msg',     'Olá! Vi a história da ADESIAP Minas e gostaria de saber mais.', 'CTA Quem Somos — mensagem', 'whatsapp', false),

    ('wa_cta_governanca_numero',  '553184011390', 'CTA Governança',                     'whatsapp', false),
    ('wa_cta_governanca_msg',     'Olá! Gostaria de saber mais sobre projetos de governança da ADESIAP Minas.', 'CTA Governança — mensagem', 'whatsapp', false),

    ('wa_cta_agenda_numero',      '553184011390', 'CTA Agenda 2030',                    'whatsapp', false),
    ('wa_cta_agenda_msg',         'Olá! Gostaria de saber como a ADESIAP pode ajudar minha empresa com ESG e ODS.', 'CTA Agenda 2030 — mensagem', 'whatsapp', false),

    ('wa_cta_servicos_numero',    '553184011390', 'CTA Serviços',                       'whatsapp', false),
    ('wa_cta_servicos_msg',       'Olá! Gostaria de conhecer os serviços da ADESIAP Minas.', 'CTA Serviços — mensagem', 'whatsapp', false),

    ('wa_cta_projetos_numero',    '553184011390', 'CTA Projetos',                       'whatsapp', false),
    ('wa_cta_projetos_msg',       'Olá! Gostaria de falar com um especialista sobre projetos da ADESIAP Minas.', 'CTA Projetos — mensagem', 'whatsapp', false)

ON CONFLICT (chave) DO NOTHING;

-- Política pública para leitura de configs de WhatsApp (necessário para o script do site)
CREATE POLICY "publico_select_whatsapp" ON configuracoes
    FOR SELECT USING (grupo = 'whatsapp');
