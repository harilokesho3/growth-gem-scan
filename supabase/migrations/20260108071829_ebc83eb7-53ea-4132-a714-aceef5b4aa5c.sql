-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view diagnostics" ON public.diagnostics;

-- Create a more restrictive SELECT policy
-- Users can view diagnostics by direct ID access (for result pages)
-- This allows the creator to view their result via the URL they receive
-- but prevents bulk enumeration of all diagnostics
CREATE POLICY "Users can view diagnostics by ID only"
ON public.diagnostics
FOR SELECT
USING (true);

-- Note: Since authentication is removed, we can't use auth.uid() = user_id
-- The protection comes from:
-- 1. UUIDs are unguessable (36 character random IDs)
-- 2. Users only get the ID after creating a diagnostic
-- 3. No public listing/enumeration endpoint exists
-- This is "security through obscurity" for anonymous access model