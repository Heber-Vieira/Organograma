-- Adicionar coluna de justificativa para explicar desvios de headcount
ALTER TABLE headcount_planning ADD COLUMN IF NOT EXISTS justification TEXT;

-- Comentário na coluna para documentação
COMMENT ON COLUMN headcount_planning.justification IS 'Justificativa para desvios no headcount do departamento (sub ou superdimensionamento).';
