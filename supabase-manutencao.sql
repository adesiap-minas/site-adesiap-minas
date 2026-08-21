-- Adiciona chave de modo manutenção na tabela de visibilidade
-- visivel = true  → manutenção ATIVA (visitantes veem tela de manutenção)
-- visivel = false → site funcionando normalmente (padrão)
INSERT INTO visibilidade_site (chave, label, tipo, visivel) VALUES
  ('manutencao_ativa', 'Modo Manutenção (site todo)', 'secao', false)
ON CONFLICT (chave) DO NOTHING;
