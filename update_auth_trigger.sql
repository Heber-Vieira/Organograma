-- Atualiza a função de trigger para suportar METADATA de role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user'), -- Pega o role do metadata ou usa 'user'
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
