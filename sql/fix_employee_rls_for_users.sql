-- Fix RLS Policies for employees table to allow regular users to manage their org chart nodes
-- 
-- Problema: Usuários comuns não conseguiam salvar as edições, inserções e deleções
-- na visualização do organograma pois as RLS policies para `employees` apenas
-- autorizavam Admins e Owners.
--
-- Solução: Criar policies condicionais onde o usuário tem permissões nestas ações
-- caso ele seja dono ou esteja entre os usuários com acesso (allowed_users) do
-- organograma em questão (`chart_id`).

-- Permite INSERT se o usuário tem controle sobre o chart associado
CREATE POLICY "Users can insert employees in their charts" ON employees
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM charts c
    WHERE c.id = employees.chart_id
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.allowed_users))
  )
);

-- Permite UPDATE se o usuário tem controle sobre o chart associado
CREATE POLICY "Users can update employees in their charts" ON employees
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM charts c
    WHERE c.id = employees.chart_id
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.allowed_users))
  )
);

-- Permite DELETE se o usuário tem controle sobre o chart associado
CREATE POLICY "Users can delete employees in their charts" ON employees
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM charts c
    WHERE c.id = employees.chart_id
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.allowed_users))
  )
);
