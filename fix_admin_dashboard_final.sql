-- ==============================================================================
-- FIX DEFINITIVO PARA O DASHBOARD ADMINISTRATIVO
-- ==============================================================================

-- 1. Função Segura para Verificar Admin (SECURITY DEFINER)
-- Esta função roda com permissões elevadas para evitar recursão infinita nas políticas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Garantir acesso à função
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 2. Limpar Políticas Antigas (Evitar Conflitos)
DROP POLICY IF EXISTS "Enable read access for users based on role" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "admin_only_all_access" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 3. Criar Novas Políticas Limpas e Assertivas

-- POLÍTICA 1: Admins Total (Ver e Editar TUDO)
CREATE POLICY "Admins Total Access"
ON public.profiles
FOR ALL
TO authenticated
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- POLÍTICA 2: Usuários (Ver Próprio Perfil)
-- Necessário para o App carregar o role inicial
CREATE POLICY "Users View Own Profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- POLÍTICA 3: Usuários (Editar Próprio Perfil)
CREATE POLICY "Users Update Own Profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- POLÍTICA 4: Inserção (Ao criar conta)
CREATE POLICY "Users Insert Own Profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ( auth.uid() = id );

-- 4. Correção Opcional: Garantir que o usuário atual seja Admin (Descomente se necessário)
-- UPDATE profiles SET role = 'admin' WHERE email = 'teste@teste.com';
