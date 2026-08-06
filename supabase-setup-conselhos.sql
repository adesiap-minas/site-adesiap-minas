-- Tabela de Conselhos Municipais — ADESIAP Minas
-- Execute no Supabase Studio: https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS conselhos (
    id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    sigla         text        NOT NULL,
    nome_completo text        NOT NULL,
    ativo         boolean     DEFAULT true,
    ordem         integer     DEFAULT 0,
    created_at    timestamptz DEFAULT now()
);

-- Leitura pública (site)
ALTER TABLE conselhos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura_publica" ON conselhos FOR SELECT TO anon USING (true);
CREATE POLICY "escrita_anon"    ON conselhos FOR ALL    TO anon USING (true) WITH CHECK (true);

-- Dados iniciais
INSERT INTO conselhos (sigla, nome_completo, ativo, ordem) VALUES
    ('CMDE',    'Conselho Municipal de Desenvolvimento Econômico',                            true, 1),
    ('CAE',     'Conselho de Alimentação Escolar',                                            true, 2),
    ('CODEMA',  'Conselho Municipal de Desenvolvimento Sustentável e Melhoria do Ambiente',   true, 3),
    ('CMS',     'Conselho Municipal de Saúde',                                                true, 4),
    ('COMPURB', 'Conselho Municipal de Urbanismo',                                            true, 5),
    ('COMAD',   'Conselho Municipal Anti-Drogas',                                             true, 6);
