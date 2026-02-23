-- Atualiza todos os organogramas antigos (que estão sem criador) 
-- para apontar para o usuário "Heber Vieira"

DO $$
DECLARE
    heber_id uuid;
BEGIN
    -- Busca o ID do Heber baseado no email ou nome
    SELECT id INTO heber_id 
    FROM public.profiles 
    WHERE email = 'heber.vieira.hv@gmail.com' OR full_name ILIKE '%Heber Vieira%'
    LIMIT 1;

    -- Se encontrou o Heber, atualiza os organogramas
    IF heber_id IS NOT NULL THEN
        UPDATE public.charts
        SET created_by = heber_id
        WHERE created_by IS NULL;
        
        RAISE NOTICE 'Organogramas atualizados com sucesso para o usuário %', heber_id;
    ELSE
        RAISE EXCEPTION 'Usuário Heber Vieira não encontrado no banco de dados.';
    END IF;
END $$;
