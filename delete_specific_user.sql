-- EXCLUIR USUÁRIO ESPECÍFICO E SUAS DEPENDÊNCIAS
-- Executar no SQL Editor do Supabase

DO $$
DECLARE
    v_user_email TEXT := 'heber.vieira.hv@gmail.com';
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;

    IF v_user_id IS NOT NULL THEN
        -- 1. Excluir Colaboradores vinculados às organizações desse dono
        -- A tabela 'employees' existe e tem 'organization_id'
        DELETE FROM public.employees 
        WHERE organization_id IN (SELECT id FROM public.organizations WHERE owner_id = v_user_id);

        -- 2. Excluir a Organização em si
        -- A tabela 'organizations' existe e tem 'owner_id'
        DELETE FROM public.organizations WHERE owner_id = v_user_id;

        -- 3. Remover da tabela de perfis
        DELETE FROM public.profiles WHERE id = v_user_id;

        -- 4. Remover do sistema de autenticação
        DELETE FROM auth.users WHERE id = v_user_id;

        RAISE NOTICE 'Usuário % e seus dados foram removidos com sucesso.', v_user_email;
    ELSE
        RAISE NOTICE 'Usuário % não encontrado.', v_user_email;
    END IF;
END $$;
