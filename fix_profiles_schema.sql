-- ==============================================================================
-- CORREÇÃO DA TABELA DE PERFIS: ADICIONAR created_at
-- ==============================================================================

-- 1. Adicionar coluna created_at se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. Atualizar registros existentes para ter uma data (opcional, já que o DEFAULT cuida disso para novos)
-- Mas para garantir ordem nos antigos:
UPDATE public.profiles 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 3. (Opcional) Garantir que novos inserts usem o default automaticamente
-- Isso já acontece pelo DEFAULT na definição, mas reforçando:
ALTER TABLE public.profiles 
ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now());
