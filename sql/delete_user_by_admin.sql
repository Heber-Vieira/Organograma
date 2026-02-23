-- Função Postgres para permitir que administradores deletem usuários completamente (inclusive da tabela auth.users)
-- Isso evita o erro de "User already registered" ao tentar recriar um usuário que foi apagado apenas do frontend.

CREATE OR REPLACE FUNCTION delete_user_by_admin(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Verifica se quem chamou a função tem a role 'admin'
  -- Essa verificação garante segurança para que apenas administradores consigam usar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários.';
  END IF;

  -- 2. Deleta o usuário da tabela public.profiles caso ainda exista
  DELETE FROM public.profiles WHERE id = user_id;

  -- 3. Deleta o usuário da tabela de autenticação do Supabase (auth.users)
  -- Isso libera o e-mail para ser cadastrado novamente
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;
