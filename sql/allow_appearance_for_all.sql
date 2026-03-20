-- PERMISSÃO PARA TODOS OS USUÁRIOS ALTERAREM A APARÊNCIA DA ORGANIZAÇÃO
-- Isso permite que o logotipo e a cor primária sejam atualizados no nível da organização.

-- 1. Habilitar RLS na tabela organizations (se não estiver habilitado)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 2. Permitir que qualquer usuário autenticado VEJA os dados da organização
DROP POLICY IF EXISTS "Anyone can view organizations" ON organizations;
CREATE POLICY "Anyone can view organizations"
ON organizations FOR SELECT
TO authenticated
USING (true);

-- 3. Permitir que qualquer usuário autenticado ATUALIZE a aparência (logo e cor)
-- Nota: Esta política permite que qualquer membro altere as configurações visuais globais.
DROP POLICY IF EXISTS "Authenticated users can update organization appearance" ON organizations;
CREATE POLICY "Authenticated users can update organization appearance"
ON organizations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Garantir que as colunas necessárias existam
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'organizations'::regclass AND attname = 'primary_color') THEN
        ALTER TABLE organizations ADD COLUMN primary_color TEXT;
    END IF;
END $$;
