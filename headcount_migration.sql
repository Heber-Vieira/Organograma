-- Create headcount_planning table
CREATE TABLE IF NOT EXISTS headcount_planning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    department TEXT,
    required_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add permission column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS view_headcount_permission BOOLEAN DEFAULT false;

-- RLS Policies for headcount_planning
ALTER TABLE headcount_planning ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to headcount_planning"
ON headcount_planning FOR ALL
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- Users with permission can view
CREATE POLICY "Users with permission can view headcount_planning"
ON headcount_planning FOR SELECT
USING ( 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    (SELECT view_headcount_permission FROM profiles WHERE id = auth.uid()) = true
);

-- Profiles visibility update (ensure admins can see the new column)
-- The existing "Admins can view all profiles" already covers this if it's select *
