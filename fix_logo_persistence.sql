-- 1. Garante que a coluna existe
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Habilita RLS (Segurança a nível de linha)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 3. Cria política para permitir que o dono da organização veja sua organização
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization"
ON organizations FOR SELECT
USING (auth.uid() = owner_id);

-- 4. Cria política para permitir que o dono ATUALIZE sua organização (incluindo logo)
DROP POLICY IF EXISTS "Users can update their own organization" ON organizations;
CREATE POLICY "Users can update their own organization"
ON organizations FOR UPDATE
USING (auth.uid() = owner_id);

-- 5. Cria política para permitir INSERIR organização (no primeiro login)
DROP POLICY IF EXISTS "Users can insert their own organization" ON organizations;
CREATE POLICY "Users can insert their own organization"
ON organizations FOR INSERT
WITH CHECK (auth.uid() = owner_id);
