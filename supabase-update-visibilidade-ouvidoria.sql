-- Adiciona opção para ocultar o Canal de Denúncias dentro da página de Ouvidoria
INSERT INTO visibilidade_site (chave, label, tipo) VALUES
  ('secao_ouvidoria-denuncias', 'Canal de Denúncias (Ouvidoria)', 'secao')
ON CONFLICT (chave) DO NOTHING;
