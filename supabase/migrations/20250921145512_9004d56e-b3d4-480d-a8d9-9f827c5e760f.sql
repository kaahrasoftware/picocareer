-- Allow anonymous users to view approved mentor profiles for public discovery
CREATE POLICY "Public can view approved mentor profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'mentor' 
  AND onboarding_status = 'Approved'
);