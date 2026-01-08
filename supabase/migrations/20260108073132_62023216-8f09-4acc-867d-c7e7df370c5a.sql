-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view diagnostics by ID only" ON public.diagnostics;

-- Create a proper owner-scoped SELECT policy
-- Users can only view their own diagnostics when authenticated
CREATE POLICY "Users can view their own diagnostics"
ON public.diagnostics
FOR SELECT
USING (auth.uid() = user_id);

-- Also update INSERT policy to properly set user_id for authenticated users
DROP POLICY IF EXISTS "Anyone can create diagnostics" ON public.diagnostics;

-- Allow authenticated users to create diagnostics with their user_id
CREATE POLICY "Authenticated users can create diagnostics"
ON public.diagnostics
FOR INSERT
WITH CHECK (auth.uid() = user_id);