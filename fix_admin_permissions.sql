-- CORREÇÃO CRÍTICA DE PERMISSÕES
-- O erro anterior ocorria porque habilitamos a segurança (RLS), mas esquecemos de dizer
-- que "o usuário pode ver seu próprio perfil". Sem isso, ninguém consegue logar ou ver se é admin.

-- 1. Permite que QUALQUER usuário veja seu PRÓPRIO perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Permite que QUALQUER usuário EDITE seu PRÓPRIO perfil (nome, avatar, etc)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. Mantém a política dos Admins (ver tudo)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Mantém a política dos Admins (editar tudo)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- DICA: Se ainda não for admin, rode o comando abaixo com seu email:
-- UPDATE profiles SET role = 'admin' WHERE email = 'SEU_EMAIL_AQUI';
