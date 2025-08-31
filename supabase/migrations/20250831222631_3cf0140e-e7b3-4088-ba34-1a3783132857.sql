-- CRITICAL SECURITY FIX: Enable RLS and secure the profiles table
-- This fixes the vulnerability where sensitive user data is publicly accessible

-- Step 1: Enable RLS on the profiles table (this is the critical security fix)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop the dangerous policies that allow unrestricted public access
DROP POLICY IF EXISTS "Allow public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Step 3: Create secure mentor visibility policy for legitimate discovery use cases
CREATE POLICY "Limited mentor profile visibility" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  user_type = 'mentor' 
  AND onboarding_status = 'Approved'
  AND auth.uid() != id
);

-- Note: Other secure policies already exist:
-- - Users can view own profile
-- - Users can update own profile  
-- - Users can delete own profile
-- - Admins can view all profiles
-- - Admins can update any profile
-- These remain unchanged to preserve existing functionality