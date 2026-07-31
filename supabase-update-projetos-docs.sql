-- ============================================================
-- Migração: Prestação de Contas nos Projetos
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Adiciona a coluna documentos_pc na tabela projetos
ALTER TABLE projetos
    ADD COLUMN IF NOT EXISTS documentos_pc jsonb DEFAULT '[]'::jsonb;

-- 2. Cria o bucket de documentos (se ainda não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'docs-projetos',
    'docs-projetos',
    true,
    20971520,  -- 20 MB
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Política: leitura pública dos documentos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'docs-projetos leitura pública'
    ) THEN
        CREATE POLICY "docs-projetos leitura pública"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'docs-projetos');
    END IF;
END $$;

-- 4. Política: upload público (anon key pode enviar)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'docs-projetos upload'
    ) THEN
        CREATE POLICY "docs-projetos upload"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'docs-projetos');
    END IF;
END $$;

-- 5. Política: exclusão (para remover docs obsoletos via admin)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'docs-projetos exclusão'
    ) THEN
        CREATE POLICY "docs-projetos exclusão"
            ON storage.objects FOR DELETE
            USING (bucket_id = 'docs-projetos');
    END IF;
END $$;
