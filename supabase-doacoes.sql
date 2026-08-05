-- ============================================================
-- Migração: Módulo de Doações
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela de cadastros de doadores
CREATE TABLE IF NOT EXISTS doacoes (
    id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    criado_em             timestamptz DEFAULT now(),

    -- Perfil
    tipo_doador           text        NOT NULL CHECK (tipo_doador IN ('pf', 'pj')),

    -- Pessoa Física
    nome_completo         text,
    cpf                   text,
    is_pep                boolean     DEFAULT false,
    comprovante_residencia text,

    -- Pessoa Jurídica
    razao_social          text,
    cnpj                  text,
    nome_representante    text,

    -- Comum
    email                 text        NOT NULL,
    telefone              text        NOT NULL,

    -- Doação
    valor_pretendido      text,
    contrapartida_imagem  boolean     DEFAULT false,

    -- Documentos enviados (array de {nome, campo, url})
    documentos            jsonb       DEFAULT '[]'::jsonb,

    -- Status de análise
    status                text        DEFAULT 'pendente'
                                      CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado')),
    observacao_interna    text,

    -- Declarações
    aceite_origem         boolean     NOT NULL DEFAULT false,
    aceite_lgpd           boolean     NOT NULL DEFAULT false
);

-- Índices úteis para o admin
CREATE INDEX IF NOT EXISTS doacoes_criado_em_idx  ON doacoes (criado_em DESC);
CREATE INDEX IF NOT EXISTS doacoes_status_idx     ON doacoes (status);
CREATE INDEX IF NOT EXISTS doacoes_tipo_idx       ON doacoes (tipo_doador);

-- Habilitar RLS
ALTER TABLE doacoes ENABLE ROW LEVEL SECURITY;

-- Política: apenas INSERT anônimo (o site envia o cadastro)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'doacoes' AND policyname = 'doacoes insert anon'
    ) THEN
        CREATE POLICY "doacoes insert anon"
            ON doacoes FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- Política: SELECT e UPDATE apenas via service_role (admin interno)
-- O admin acessa via Dashboard do Supabase ou via service_role key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'doacoes' AND policyname = 'doacoes admin acesso'
    ) THEN
        CREATE POLICY "doacoes admin acesso"
            ON doacoes FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================
-- 2. Bucket de documentos de doação
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'docs-doacoes',
    'docs-doacoes',
    true,
    10485760,  -- 10 MB
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Política: leitura pública
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'docs-doacoes leitura pública'
    ) THEN
        CREATE POLICY "docs-doacoes leitura pública"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'docs-doacoes');
    END IF;
END $$;

-- Política: upload anônimo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'docs-doacoes upload'
    ) THEN
        CREATE POLICY "docs-doacoes upload"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'docs-doacoes');
    END IF;
END $$;
