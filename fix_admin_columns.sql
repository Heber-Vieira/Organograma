-- Este script garante que a tabela de perfis tem as colunas corretas para o sistema de Admin
-- Execute-o no SQL Editor do Supabase se estiver vendo erros como 'column "role" does not exist'

-- 1. Cria funções úteis para evitar erros se as colunas já existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END
$$;

-- 2. Garante que as políticas de segurança (RLS) existem
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. [OPCIONAL] Para promover seu usuário a Admin imediatamente, 
-- descomente a linha abaixo e substitua pelo seu email:

-- UPDATE profiles SET role = 'admin' WHERE email = 'SEU_EMAIL_AQUI';
