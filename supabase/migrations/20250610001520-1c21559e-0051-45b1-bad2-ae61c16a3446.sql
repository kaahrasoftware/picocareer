
-- First, let's check for any recursive RLS policies on the profiles table
-- and create a safe security definer function to avoid recursion

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;

-- Create a security definer function to safely get the current user ID
-- This prevents recursive policy calls
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT user_type INTO user_role 
  FROM auth.users 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create safe RLS policies using security definer functions
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = public.get_current_user_id());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = public.get_current_user_id());

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (id = public.get_current_user_id());

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_current_user_admin());

-- Allow admins to update all profiles  
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_current_user_admin());
