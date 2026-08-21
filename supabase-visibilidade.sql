-- ── Tabela de visibilidade de páginas e seções ────────────────────────────────
CREATE TABLE IF NOT EXISTS visibilidade_site (
  chave        TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  visivel      BOOLEAN NOT NULL DEFAULT true,
  tipo         TEXT NOT NULL CHECK (tipo IN ('pagina','secao')),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visibilidade_site ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode ler (necessário para o JS público verificar visibilidade)
CREATE POLICY "vis_leitura_publica" ON visibilidade_site
  FOR SELECT USING (true);

-- Escrita somente via service_role (a API usa service key e já valida o JWT)

-- ── Seed: páginas ─────────────────────────────────────────────────────────────
INSERT INTO visibilidade_site (chave, label, tipo) VALUES
  ('pagina_quem-somos',            'Quem Somos',                   'pagina'),
  ('pagina_selos',                 'Selos e Reconhecimentos',       'pagina'),
  ('pagina_terceiro-setor',        'O Terceiro Setor',              'pagina'),
  ('pagina_governanca',            'Governança',                    'pagina'),
  ('pagina_agenda-2030',           'Agenda 2030',                   'pagina'),
  ('pagina_transparencia',         'Transparência',                 'pagina'),
  ('pagina_servicos',              'Serviços',                      'pagina'),
  ('pagina_projetos',              'Projetos',                      'pagina'),
  ('pagina_doacoes',               'Seja Doador',                   'pagina'),
  ('pagina_seja-parceiro',         'Seja Parceiro',                 'pagina'),
  ('pagina_ouvidoria',             'Ouvidoria',                     'pagina'),
  ('pagina_canal-denuncias',       'Canal de Denúncias',            'pagina'),
  ('pagina_trabalhe-conosco',      'Trabalhe Conosco',              'pagina'),
  ('pagina_fale-conosco',          'Fale Conosco',                  'pagina'),
  ('pagina_cadastro-fornecedores', 'Cadastro de Fornecedores',      'pagina'),
  ('pagina_politica-privacidade',  'Política de Privacidade',       'pagina')
ON CONFLICT (chave) DO NOTHING;

-- ── Seed: seções da index ─────────────────────────────────────────────────────
INSERT INTO visibilidade_site (chave, label, tipo) VALUES
  ('secao_hero',          'Hero / Banner Principal',  'secao'),
  ('secao_quem-somos',    'Conheça a ADESIAP',        'secao'),
  ('secao_parceiros',     'Parceiros',                'secao'),
  ('secao_onde-estamos',  'Onde Estamos',             'secao'),
  ('secao_impacto',       'Painel de Impacto',        'secao'),
  ('secao_governanca',    'Governança (seção)',        'secao'),
  ('secao_servicos',      'Serviços (seção)',          'secao'),
  ('secao_projetos',      'Projetos (seção)',          'secao'),
  ('secao_noticias',      'Notícias',                 'secao'),
  ('secao_instagram',     'Instagram Feed',           'secao')
ON CONFLICT (chave) DO NOTHING;
