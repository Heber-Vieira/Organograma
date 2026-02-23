-- Adicionar a nova coluna para controle específico de editores
ALTER TABLE charts ADD COLUMN editor_users uuid[] DEFAULT '{}'::uuid[];

-- Migrar quem já tinha acesso (allowed_users) para a nova coluna permitindo edição temporariamente
UPDATE charts 
SET editor_users = allowed_users 
WHERE allowed_users IS NOT NULL;

-- Atualizar as políticas RLS na tabela employees para verificar 'editor_users'
DROP POLICY IF EXISTS "Users can insert employees in their charts" ON employees;
CREATE POLICY "Users can insert employees in their charts" ON employees
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM charts c
    WHERE c.id = employees.chart_id
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.editor_users))
  )
);

DROP POLICY IF EXISTS "Users can update employees in their charts" ON employees;
CREATE POLICY "Users can update employees in their charts" ON employees
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM charts c
    WHERE c.id = employees.chart_id
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.editor_users))
  )
);

DROP POLICY IF EXISTS "Users can delete employees in their charts" ON employees;
CREATE POLICY "Users can delete employees in their charts" ON employees
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM charts c
    WHERE c.id = employees.chart_id
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.editor_users))
  )
);
