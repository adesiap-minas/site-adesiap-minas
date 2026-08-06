-- Tabela de Cadastro de Parceiros — ADESIAP Minas
-- Execute no Supabase Studio: https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS parceiros (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    razao_social text       NOT NULL,
    cnpj        text,
    email       text,
    dados       jsonb,
    created_at  timestamptz DEFAULT now()
);

-- Leitura pública negada; escrita anon permitida (formulário público)
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insercao_publica" ON parceiros FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "leitura_autenticada" ON parceiros FOR SELECT TO authenticated USING (true);
