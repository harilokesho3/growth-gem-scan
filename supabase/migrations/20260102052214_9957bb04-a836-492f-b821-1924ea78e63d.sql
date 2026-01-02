-- Update RLS policies for diagnostics table to allow anonymous inserts and selects
DROP POLICY IF EXISTS "Users can view their own diagnostics" ON public.diagnostics;
DROP POLICY IF EXISTS "Users can create their own diagnostics" ON public.diagnostics;
DROP POLICY IF EXISTS "Users can update their own diagnostics" ON public.diagnostics;

-- Allow anyone to insert diagnostics (anonymous submissions)
CREATE POLICY "Anyone can create diagnostics" 
ON public.diagnostics 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view diagnostics by ID (for result pages)
CREATE POLICY "Anyone can view diagnostics" 
ON public.diagnostics 
FOR SELECT 
USING (true);

-- Allow updates (for AI analysis completion)
CREATE POLICY "Anyone can update diagnostics" 
ON public.diagnostics 
FOR UPDATE 
USING (true);

-- Update RLS policies for idea_validations table to allow anonymous access
DROP POLICY IF EXISTS "Users can view their own idea validations" ON public.idea_validations;
DROP POLICY IF EXISTS "Users can create their own idea validations" ON public.idea_validations;
DROP POLICY IF EXISTS "Users can update their own idea validations" ON public.idea_validations;

-- Allow anyone to insert idea validations (anonymous submissions)
CREATE POLICY "Anyone can create idea validations" 
ON public.idea_validations 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view idea validations by ID (for result pages)
CREATE POLICY "Anyone can view idea validations" 
ON public.idea_validations 
FOR SELECT 
USING (true);

-- Allow updates (for AI analysis completion)
CREATE POLICY "Anyone can update idea validations" 
ON public.idea_validations 
FOR UPDATE 
USING (true);

-- Make user_id nullable for both tables to support anonymous submissions
ALTER TABLE public.diagnostics ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.idea_validations ALTER COLUMN user_id DROP NOT NULL;