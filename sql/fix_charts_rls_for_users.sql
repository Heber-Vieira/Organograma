-- Allow all users to create charts
-- We also ensure users can view, update, and delete their own charts

-- 1. Permite que qualquer usuário autenticado insira um novo organograma
-- O 'created_by' deve obrigatoriamente ser o ID do usuário (auth.uid())
DROP POLICY IF EXISTS "Users can insert charts" ON charts;
CREATE POLICY "Users can insert charts" ON charts
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 2. Permite que o usuário veja organogramas que ele criou, 
-- onde ele é editor, onde ele está explicitamente permitido,
-- ou se ele for um administrador.
DROP POLICY IF EXISTS "Users can view charts they created or have access to" ON charts;
CREATE POLICY "Users can view charts they created or have access to" ON charts
FOR SELECT TO authenticated
USING (
  created_by = auth.uid() OR 
  auth.uid() = ANY(editor_users) OR 
  auth.uid() = ANY(allowed_users) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Permite que o usuário edite organogramas que ele criou
DROP POLICY IF EXISTS "Users can update charts they created" ON charts;
CREATE POLICY "Users can update charts they created" ON charts
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 4. Permite que o usuário exclua organogramas que ele criou
DROP POLICY IF EXISTS "Users can delete charts they created" ON charts;
CREATE POLICY "Users can delete charts they created" ON charts
FOR DELETE TO authenticated
USING (created_by = auth.uid());
