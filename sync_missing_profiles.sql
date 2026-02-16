-- ==============================================================================
-- FIX PARA USUÁRIOS QUE NÃO APARECEM NO PAINEL (Sincronização Auth -> Profiles)
-- ==============================================================================

-- Este comando insere na tabela pública todos os usuários que estão na autenticação
-- mas que por algum motivo (erro no cadastro, deleção manual) não têm perfil.

INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Usuário sem Nome'), 
    'user', -- Define como usuário comum por padrão
    TRUE,   -- Define como ativo por padrão
    created_at, 
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Confirmação opcional: Verifique se o usuário específico agora existe
-- SELECT * FROM public.profiles WHERE email = 'heber.vieira.hv@gmail.com';
