-- Fix the language check constraint to include Arabic ('ar')
-- Run this SQL in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE public.labor_grievances
DROP CONSTRAINT IF EXISTS labor_grievances_language_check;

-- Then, add the updated constraint with Arabic included
ALTER TABLE public.labor_grievances
ADD CONSTRAINT labor_grievances_language_check
CHECK (language IN ('en', 'pt', 'af', 'sw', 'ar'));

-- Verify the constraint was added
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'labor_grievances_language_check';
