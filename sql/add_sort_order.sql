-- Add sort_order to employees to allow arbitrary ordering among siblings
ALTER TABLE employees ADD COLUMN sort_order double precision DEFAULT 0;

-- You may also want to index it for faster sorting, though typical org charts are small per parent
CREATE INDEX idx_employees_sort_order ON employees (sort_order);
