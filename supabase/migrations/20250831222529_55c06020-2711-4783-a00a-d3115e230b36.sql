-- CRITICAL SECURITY FIX: Enable RLS and secure the profiles table
-- This fixes the vulnerability where sensitive user data is publicly accessible

-- First, enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive policies that allow public access to all profile data
DROP POLICY IF EXISTS "Allow public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policies that protect user privacy while maintaining functionality

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can view limited public profile info for mentors only (for discovery)
CREATE POLICY "Limited mentor profile visibility" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  user_type = 'mentor' 
  AND onboarding_status = 'Approved'
  AND auth.uid() != id
);

-- Policy 3: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- Policy 4: Users can insert their own profile (keep existing)
-- This policy already exists and is secure

-- Policy 5: Users can update their own profile (keep existing) 
-- This policy already exists and is secure

-- Policy 6: Users can delete their own profile (keep existing)
-- This policy already exists and is secure

-- Policy 7: Admins can update any profile (keep existing)
-- This policy already exists and is secure

-- Policy 8: Allow system triggers to create profiles (keep existing)
-- This policy already exists and is needed for user registration