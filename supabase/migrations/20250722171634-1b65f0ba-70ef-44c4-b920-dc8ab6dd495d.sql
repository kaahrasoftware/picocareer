
-- Add admin access policy for wallets table
CREATE POLICY "Admins can view all wallets" 
ON public.wallets 
FOR SELECT 
TO authenticated 
USING (is_admin());

-- Also add admin access policy for profiles table to ensure the join works properly
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (is_admin());
