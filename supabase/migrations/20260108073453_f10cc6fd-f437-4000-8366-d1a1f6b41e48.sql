-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view idea validations" ON public.idea_validations;

-- Create a proper owner-scoped SELECT policy
CREATE POLICY "Users can view their own idea validations"
ON public.idea_validations
FOR SELECT
USING (auth.uid() = user_id);

-- Update INSERT policy to require user_id
DROP POLICY IF EXISTS "Anyone can create idea validations" ON public.idea_validations;

-- Allow authenticated users to create idea validations with their user_id
CREATE POLICY "Authenticated users can create idea validations"
ON public.idea_validations
FOR INSERT
WITH CHECK (auth.uid() = user_id);