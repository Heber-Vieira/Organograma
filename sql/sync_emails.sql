-- ==============================================================================
-- SINCRONIZAÇÃO DE E-MAILS (Auth -> Profiles)
-- ==============================================================================
-- Este script sincroniza a coluna 'email' da tabela 'profiles' com os dados reais
-- da tabela 'auth.users'. Necessário para usuários criados antes da implementação
-- da sincronização automática no trigger.

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id 
  AND (p.email IS NULL OR p.email = '');

-- Opcional: Verifique se ainda restam perfis sem e-mail
-- SELECT id, full_name FROM public.profiles WHERE email IS NULL OR email = '';
