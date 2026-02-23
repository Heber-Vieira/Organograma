-- 0. Garantir que exclusão de dono de organização não quebre o banco
-- Removemos a obrigatoriedade do owner_id (NOT NULL) para que possamos definir como nulo
ALTER TABLE public.organizations ALTER COLUMN owner_id DROP NOT NULL;

-- Alteramos a chave estrangeira owner_id da tabela organizations para ON DELETE SET NULL
ALTER TABLE public.organizations
DROP CONSTRAINT IF EXISTS organizations_owner_id_fkey;

ALTER TABLE public.organizations
ADD CONSTRAINT organizations_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES auth.users(id)
ON DELETE SET NULL;

-- 1. Ensure `created_by` in `charts` table doesn't block deletion (ON DELETE SET NULL)
ALTER TABLE public.charts
DROP CONSTRAINT IF EXISTS charts_created_by_fkey;

ALTER TABLE public.charts
ADD CONSTRAINT charts_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- 2. Drop the old trigger so we can safely replace it sem erros de constraint
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Recreate the trigger function properly ensuring it doesn't fail on re-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We use INSERT ... ON CONFLICT DO NOTHING to avoid duplicate key errors
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'user'))
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Force Delete Marcia (By Email) from both tables directly to clear the clog
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find the user ID by email
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'marcia.silva@manserv.com.br' LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- Delete from charts references first just in case
        UPDATE public.charts SET created_by = NULL WHERE created_by = target_user_id;
        
        -- Delete from profiles
        DELETE FROM public.profiles WHERE id = target_user_id;
        
        -- Finally delete from auth.users (Organizações associadas ficarão com owner_id = NULL)
        DELETE FROM auth.users WHERE id = target_user_id;
    END IF;
END $$;
