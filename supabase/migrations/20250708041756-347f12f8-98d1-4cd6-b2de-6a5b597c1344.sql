-- Fix RLS policy conflict for organization creation
-- Allow admins to create organizations with any contact email

-- Drop the restrictive initial creation policy
DROP POLICY IF EXISTS "api_orgs_initial_creation" ON api_organizations;

-- Create a new policy that only applies to non-admin users for initial creation
CREATE POLICY "api_orgs_initial_creation_non_admin" ON api_organizations
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
  NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('admin', 'editor')
  )
);

-- Ensure the admin policy covers all operations including INSERT
DROP POLICY IF EXISTS "api_orgs_admin_access" ON api_organizations;
CREATE POLICY "api_orgs_admin_access" ON api_organizations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('admin', 'editor')
  )
);