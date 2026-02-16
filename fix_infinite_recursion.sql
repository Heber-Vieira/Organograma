-- CORREÇÃO DE RECURSÃO INFINITA
-- O erro "infinite recursion" acontece porque a política "Admins can view all profiles"
-- consultava a tabela "profiles", que acionava a política de novo, em loop.

-- 1. Cria uma função segura que checa se é admin SEM disparar as políticas de novo (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Limpa as políticas antigas que estavam dando conflito
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles visibility" ON profiles; -- caso exista de tentativas anteriores

-- 3. Cria uma política UNIFICADA e SEGURA para Visualização (SELECT)
CREATE POLICY "Profiles visibility"
ON profiles FOR SELECT
USING (
  auth.uid() = id   -- Usuário vê a si mesmo
  OR
  is_admin()        -- Admin vê todos (usando a função segura)
);

-- 4. Limpa as políticas antigas de atualização
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles updates" ON profiles; -- caso exista

-- 5. Cria uma política UNIFICADA e SEGURA para Edição (UPDATE)
CREATE POLICY "Profiles updates"
ON profiles FOR UPDATE
USING (
  auth.uid() = id   -- Usuário edita a si mesmo
  OR
  is_admin()        -- Admin edita todos
);
