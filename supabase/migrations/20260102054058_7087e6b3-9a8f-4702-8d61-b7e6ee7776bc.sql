-- Drop the existing SELECT policy that could expose anonymous feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;

-- Create a new policy that only allows authenticated users to view their own feedback
-- Anonymous feedback (user_id IS NULL) cannot be read by anyone
CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (
  user_id IS NOT NULL 
  AND auth.uid() = user_id
);