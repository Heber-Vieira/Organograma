-- Adiciona a coluna logo_url caso não exista
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT; 

-- Adiciona a coluna logo caso não exista (fallback para garantir compatibilidade)
-- Algumas implementações anteriores podem ter usado 'logo'
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo TEXT;
