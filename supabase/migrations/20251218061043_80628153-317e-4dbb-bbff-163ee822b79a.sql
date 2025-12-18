-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;

-- Create a new PERMISSIVE INSERT policy (default behavior)
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
TO public
WITH CHECK (true);