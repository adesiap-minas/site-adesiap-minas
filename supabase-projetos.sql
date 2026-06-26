-- =====================================================
-- ADESIAP MINAS — Projetos: Categorias + Migração
-- Executar no Supabase: Dashboard → SQL Editor → New query
-- =====================================================

-- =====================================================
-- 1. TABELA CATEGORIAS (nova)
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,           -- Mapeia para classe CSS: cat-{slug}
    secao TEXT NOT NULL,                 -- Agrupamento de seção na página
    icone TEXT DEFAULT 'fas fa-folder',  -- Classe Font Awesome
    cor_principal TEXT DEFAULT '#12395D',-- --cat-color
    cor_forte TEXT DEFAULT '#0a2135',    -- --cat-color-strong
    cor_clara TEXT DEFAULT '#e7effa',    -- --cat-color-light
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE
);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publico_select_categorias" ON categorias
    FOR SELECT USING (ativo = TRUE);

-- =====================================================
-- 2. MIGRAÇÃO DA TABELA PROJETOS (adicionar colunas)
-- =====================================================
ALTER TABLE projetos
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id),
    ADD COLUMN IF NOT EXISTS subtag TEXT,
    ADD COLUMN IF NOT EXISTS galeria_urls TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS indicadores JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS local TEXT,
    ADD COLUMN IF NOT EXISTS ano TEXT,
    ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Garantir slug único quando preenchido
CREATE UNIQUE INDEX IF NOT EXISTS projetos_slug_key ON projetos (slug) WHERE slug IS NOT NULL;

-- =====================================================
-- 3. STORAGE BUCKET PARA GALERIA (se não criado antes)
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
    VALUES ('imagens-projetos', 'imagens-projetos', TRUE)
    ON CONFLICT (id) DO NOTHING;

-- Política de upload pelo admin (service_role)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects'
          AND schemaname = 'storage'
          AND policyname = 'upload_imagens_projetos'
    ) THEN
        EXECUTE 'CREATE POLICY "upload_imagens_projetos" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = ''imagens-projetos'')';
    END IF;
END$$;

-- =====================================================
-- 4. SEED — CATEGORIAS
-- =====================================================
INSERT INTO categorias (nome, slug, secao, icone, cor_principal, cor_forte, cor_clara, ordem) VALUES
    ('Desenvolvimento Econômico',        'economico',       'Desenvolvimento Econômico',              'fas fa-chart-line',   '#12395D', '#0a2135', '#e7effa', 1),
    ('Desenvolvimento Social',           'social',          'Desenvolvimento Social e Geração de Renda','fas fa-hands-helping','#B85C38', '#8a452a', '#fdf2ed', 2),
    ('Geração de Renda',                 'renda',           'Desenvolvimento Social e Geração de Renda','fas fa-hand-holding-usd','#F4A261','#d38141','#fef5ec', 3),
    ('Sustentabilidade',                 'sustentabilidade','Sustentabilidade e Infraestrutura',       'fas fa-leaf',         '#3B8C6E', '#2a634e', '#eff7f2', 4),
    ('Infraestrutura e Obras',           'infraestrutura',  'Sustentabilidade e Infraestrutura',       'fas fa-hard-hat',     '#5F6B76', '#3d464d', '#f1f3f4', 5),
    ('Mobilidade e Urbanismo',           'mobilidade',      'Sustentabilidade e Infraestrutura',       'fas fa-road',         '#2A9D8F', '#1e7167', '#ebf6f5', 6),
    ('Cultura, Educação e Lazer',        'cultura',         'Educação, Cultura, Esporte e Lazer',      'fas fa-palette',      '#D9902F', '#a66e24', '#fef8e8', 7),
    ('Esporte e Saúde',                  'esporte',         'Educação, Cultura, Esporte e Lazer',      'fas fa-running',      '#E63946', '#b12c36', '#fdedee', 8)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 5. SEED — PROJETOS (26 projetos do site)
-- =====================================================
DO $$
DECLARE
    cat_economico       UUID;
    cat_social          UUID;
    cat_renda           UUID;
    cat_sustentabilidade UUID;
    cat_infraestrutura  UUID;
    cat_mobilidade      UUID;
    cat_cultura         UUID;
    cat_esporte         UUID;
BEGIN
    SELECT id INTO cat_economico       FROM categorias WHERE slug = 'economico';
    SELECT id INTO cat_social          FROM categorias WHERE slug = 'social';
    SELECT id INTO cat_renda           FROM categorias WHERE slug = 'renda';
    SELECT id INTO cat_sustentabilidade FROM categorias WHERE slug = 'sustentabilidade';
    SELECT id INTO cat_infraestrutura  FROM categorias WHERE slug = 'infraestrutura';
    SELECT id INTO cat_mobilidade      FROM categorias WHERE slug = 'mobilidade';
    SELECT id INTO cat_cultura         FROM categorias WHERE slug = 'cultura';
    SELECT id INTO cat_esporte         FROM categorias WHERE slug = 'esporte';

    -- === DESENVOLVIMENTO ECONÔMICO ===
    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano, parceiros) VALUES
    ('sde-semana-desenvolvimento', 'SDE - Semana de Desenvolvimento', 'Desenvolvimento Econômico',
     'O maior evento de fomento ao empreendedorismo regional, unindo poder público e iniciativa privada para gerar negócios e empregos.',
     'Desenvolvimento Econômico', cat_economico, ARRAY[8],
     'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
     TRUE, TRUE, 1, 'Minas Gerais', '2023–2025', ARRAY['SEBRAE', 'Prefeituras Parceiras'])
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('sde-minas', 'SDE Minas', 'Desenvolvimento Econômico',
     'Iniciativa estratégica para apoiar e fortalecer o desenvolvimento sustentável em todos os territórios mineiros, reduzindo desigualdades.',
     'Desenvolvimento Econômico', cat_economico, ARRAY[8, 10],
     'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 2, 'Minas Gerais', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano, parceiros) VALUES
    ('campe-atendimento-empreendedor', 'Campe – Atendimento ao Empreendedor', 'Gestão Pública',
     'Serviços essenciais que promovem a autonomia econômica de empreendedores locais, com Selo Ouro Sebrae.',
     'Desenvolvimento Econômico', cat_economico, ARRAY[8],
     'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
     TRUE, TRUE, 3, 'Itabirito/MG', '2022–2025', ARRAY['SEBRAE Minas', 'Prefeitura de Itabirito'])
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('fnec-forum-negocios', 'FNEC – Fórum de Negócios', 'Inovação e Negócios',
     'Fomento à economia de Congonhas e região, facilitando conexões entre empreendedores, investidores e poder público.',
     'Desenvolvimento Econômico', cat_economico, ARRAY[8, 9],
     'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 4, 'Congonhas/MG', '2023')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('forum-diversificacao-mariana', 'Fórum de Diversificação de Mariana', 'Diversificação Econômica',
     'Espaço estratégico de diálogo sobre o futuro do município, reunindo líderes empresariais, mineradoras e ONGs.',
     'Desenvolvimento Econômico', cat_economico, ARRAY[8, 17],
     'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 5, 'Mariana/MG', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('feirao-veiculos-mariana', 'Feirão de Veículos de Mariana', 'Varejo e Consumo',
     'Incentivo à diversificação econômica estimulando o setor automobilístico e promovendo o crescimento da economia local.',
     'Desenvolvimento Econômico', cat_economico, ARRAY[8],
     'https://images.unsplash.com/photo-1562223058-29007f3521b4?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 6, 'Mariana/MG', '2023')
    ON CONFLICT (slug) DO NOTHING;

    -- === DESENVOLVIMENTO SOCIAL E GERAÇÃO DE RENDA ===
    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('projeto-so-por-hoje', 'Projeto Só Por Hoje', 'Saúde Pública',
     'Tratamento para dependentes de álcool e outras drogas em Itabirito, promovendo reintegração social e apoio familiar.',
     'Desenvolvimento Social', cat_social, ARRAY[3],
     'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800',
     TRUE, TRUE, 7, 'Itabirito/MG', '2020–2025')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('tamo-junto-qualificado', 'Tamo Junto e Qualificado', 'Capacitação',
     'Qualificação de dependentes químicos e familiares para reinserção social e profissional, fortalecendo a autonomia.',
     'Geração de Renda', cat_renda, ARRAY[3, 8],
     'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 8, 'Itabirito/MG', '2022')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('sos-rs-cestas', 'SOS Rio Grande do Sul – Cestas', 'Ação Humanitária',
     'Gestão eficiente da aquisição, logística e distribuição de cestas básicas e kits emergenciais para populações afetadas por enchentes.',
     'Desenvolvimento Social', cat_social, ARRAY[1, 2],
     'https://images.unsplash.com/photo-1593113589914-07599b082613?auto=format&fit=crop&q=80&w=800',
     TRUE, TRUE, 9, 'Rio Grande do Sul', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('feirao-empregos-sedese', 'Feirão de Empregos da SEDESE', 'Empregabilidade',
     'Conexão entre candidatos e empresas com gestão de evento, promovendo oportunidades e gerando indicadores de impacto social.',
     'Geração de Renda', cat_renda, ARRAY[8],
     'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 10, 'Minas Gerais', '2023')
    ON CONFLICT (slug) DO NOTHING;

    -- === SUSTENTABILIDADE E INFRAESTRUTURA ===
    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('gestao-tcas-tacs', 'Gestão de TCAs e TACs', 'Meio Ambiente',
     'Gerenciamento de Termos de Compromisso Ambiental em parceria com grandes empresas e Ministério Público.',
     'Sustentabilidade', cat_sustentabilidade, ARRAY[15, 17],
     'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 11, 'Minas Gerais', '2021–2025')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('desassoreamento-rio-itabirito', 'Desassoreamento do Rio Itabirito', 'Recuperação Ambiental',
     'Limpeza do leito do rio para aumentar a vazão, reduzir enchentes e minimizar impactos sociais e econômicos.',
     'Sustentabilidade', cat_sustentabilidade, ARRAY[13, 11],
     'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 12, 'Itabirito/MG', '2023')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('agir-gestao-riscos', 'AGIR – Gestão Integrada de Riscos', 'Gestão de Riscos',
     'Fortalecimento da gestão de riscos de barragens em Congonhas, garantindo prevenção e resposta eficaz a emergências.',
     'Infraestrutura e Obras', cat_infraestrutura, ARRAY[11],
     'https://images.unsplash.com/photo-1541888087-b50f68800994?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 13, 'Congonhas/MG', '2022–2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('apac-itabirito', 'Projeto APAC Itabirito', 'Infraestrutura Social',
     'Implantação do Centro de Reintegração Social da APAC para oferecer uma alternativa humanizada ao sistema prisional.',
     'Infraestrutura e Obras', cat_infraestrutura, ARRAY[16],
     'https://images.unsplash.com/photo-1533035353720-f1c6a75ce8c4?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 14, 'Itabirito/MG', '2023–2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('ubs-ouro-branco', 'Construção de UBS - Ouro Branco', 'Saúde Pública',
     'Construção da Unidade Básica de Saúde para promover o bem-estar e o atendimento primário à população.',
     'Infraestrutura e Obras', cat_infraestrutura, ARRAY[3],
     'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 15, 'Ouro Branco/MG', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('laboratorio-subterraneo-ufla', 'Laboratório Subterrâneo – UFLA', 'Pesquisa e Inovação',
     'Gerenciamento da construção de um laboratório para estudos em Biologia Subterrânea e avanços na Espeleologia.',
     'Infraestrutura e Obras', cat_infraestrutura, ARRAY[9, 15],
     'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 16, 'Minas Gerais', '2023')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('sos-rs-habitacional', 'SOS RS – Unidades Habitacionais', 'Habitação',
     'Gerenciamento da construção e entrega de unidades habitacionais para vítimas das enchentes no RS, garantindo moradia digna.',
     'Infraestrutura e Obras', cat_infraestrutura, ARRAY[1, 11],
     'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 17, 'Rio Grande do Sul', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('tac-pavimentacao', 'TAC Pavimentação', 'Mobilidade Urbana',
     'Melhoria da infraestrutura urbana com pavimentação de vias, sinalização e acessibilidade, garantindo mais segurança.',
     'Mobilidade e Urbanismo', cat_mobilidade, ARRAY[11],
     'https://images.unsplash.com/photo-1518241515286-981f181f0db0?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 18, 'Minas Gerais', '2023')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('ponte-rio-grande-do-sul', 'Ponte – Rio Grande do Sul', 'Infraestrutura Viária',
     'Reconstrução da ponte sobre o Arroio Corupá para retomada da mobilidade e suporte à economia local após desastres.',
     'Mobilidade e Urbanismo', cat_mobilidade, ARRAY[9, 11],
     'https://images.unsplash.com/photo-1513342791620-b106dc487c94?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 19, 'Rio Grande do Sul', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('calcadao-divinopolis', 'Calçadão de Divinópolis', 'Urbanismo',
     'Revitalização do Calçadão Caminho dos Rouxinóis, promovendo acessibilidade, lazer e valorização do centro urbano.',
     'Mobilidade e Urbanismo', cat_mobilidade, ARRAY[11],
     'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 20, 'Divinópolis/MG', '2023')
    ON CONFLICT (slug) DO NOTHING;

    -- === EDUCAÇÃO, CULTURA, ESPORTE E LAZER ===
    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('natal-nova-lima', 'Natal de Nova Lima', 'Eventos Culturais',
     'Fomento ao turismo e comércio local durante os festejos natalinos com infraestrutura de iluminação e apresentações artísticas.',
     'Cultura, Educação e Lazer', cat_cultura, ARRAY[4, 8],
     'https://images.unsplash.com/photo-1596423735880-5f2a689b903e?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 21, 'Nova Lima/MG', '2023')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('festival-batata-ouro-branco', 'Festival da Batata – Ouro Branco', 'Turismo e Entretenimento',
     'Um dos maiores festivais de Minas Gerais, impulsionando a economia e atraindo milhares de visitantes para a cidade.',
     'Cultura, Educação e Lazer', cat_cultura, ARRAY[8, 11],
     'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 22, 'Ouro Branco/MG', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('ceramica-saramenha', 'Cerâmica Saramenha', 'Patrimônio Imaterial',
     'Valorização e continuidade da tradição artesanal, com atividades de formação e preservação desse patrimônio mineiro.',
     'Cultura, Educação e Lazer', cat_cultura, ARRAY[4, 8],
     'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 23, 'Ouro Preto/MG', '2023')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('carnaval-itabirito', 'Decoração Carnaval de Itabirito', 'Cultura Popular',
     'Projeto de decoração urbana para o Carnaval, valorizando as manifestações culturais e embelezando os espaços públicos.',
     'Cultura, Educação e Lazer', cat_cultura, ARRAY[8, 11],
     'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 24, 'Itabirito/MG', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('carnaval-mariana', 'Carnaval de Mariana', 'Eventos Festivos',
     'Realização do Carnaval garantindo inclusão comunitária, fortalecimento do turismo e da economia por meio de gestão segura.',
     'Cultura, Educação e Lazer', cat_cultura, ARRAY[8, 11],
     'https://images.unsplash.com/photo-1533174000273-7d22421b5b91?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 25, 'Mariana/MG', '2024')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projetos (slug, titulo, subtag, resumo, categoria, categoria_id, ods, imagem_url, publicado, destaque, ordem, local, ano) VALUES
    ('corrida-so-por-hoje', 'Corrida Só Por Hoje', 'Esporte e Saúde',
     'Uso do esporte como ferramenta de inclusão social e conscientização sobre prevenção ao uso de drogas e hábitos saudáveis.',
     'Esporte e Saúde', cat_esporte, ARRAY[3],
     'https://images.unsplash.com/photo-1552674605-15c2145e9ca5?auto=format&fit=crop&q=80&w=800',
     TRUE, FALSE, 26, 'Itabirito/MG', '2023–2024')
    ON CONFLICT (slug) DO NOTHING;

END$$;
