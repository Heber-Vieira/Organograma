-- 1. Adiciona culunas de controle de acesso à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'; -- 'admin' ou 'user'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Atualiza RLS para permitir que Admins vejam e editem todos os perfis
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

-- INSTRUÇÕES DE USO:
-- Execute este script no SQL Editor do Supabase.
-- Depois, para se tornar admin, rode:
-- UPDATE profiles SET role = 'admin' WHERE email = 'SEU_EMAIL_AQUI';
