-- Fix security: Only allow service role to update diagnostics (for AI analysis)
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Anyone can update diagnostics" ON public.diagnostics;

-- Create a restrictive update policy - only service role can update (edge functions)
CREATE POLICY "Service role can update diagnostics" 
ON public.diagnostics 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Fix security: Only allow service role to update idea_validations (for AI analysis)
DROP POLICY IF EXISTS "Anyone can update idea validations" ON public.idea_validations;

-- Create a restrictive update policy - only service role can update (edge functions)
CREATE POLICY "Service role can update idea validations" 
ON public.idea_validations 
FOR UPDATE 
USING (auth.role() = 'service_role');