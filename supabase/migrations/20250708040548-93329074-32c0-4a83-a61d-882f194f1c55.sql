-- Phase 1B: Update RLS policies and triggers for organization portal

-- Update RLS policies for api_organizations to allow self-creation
DROP POLICY IF EXISTS "api_orgs_admin_access" ON api_organizations;

-- Allow admins full access
CREATE POLICY "api_orgs_admin_access" ON api_organizations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('admin', 'editor')
  )
);

-- Allow organization users to create and manage their own organizations
CREATE POLICY "api_orgs_self_manage" ON api_organizations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = api_organizations.contact_email
    AND profiles.user_type IN ('organization_admin', 'organization_developer', 'organization_viewer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = api_organizations.contact_email
    AND profiles.user_type IN ('organization_admin', 'organization_developer', 'organization_viewer')
  )
);

-- Allow users to create organizations if they don't have a profile yet (for initial signup)
CREATE POLICY "api_orgs_initial_creation" ON api_organizations
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create or replace the handle_new_user function to support organization users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role user_type;
  org_name TEXT;
  contact_name TEXT;
BEGIN
  -- Determine user role based on metadata
  IF NEW.raw_user_meta_data ? 'organization_name' THEN
    user_role := 'organization_admin'::user_type;
    org_name := NEW.raw_user_meta_data ->> 'organization_name';
    contact_name := NEW.raw_user_meta_data ->> 'contact_name';
  ELSE
    user_role := 'mentee'::user_type;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    user_type
  ) VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', contact_name, split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    user_role
  );

  -- Create organization if this is an organization user
  IF user_role = 'organization_admin'::user_type AND org_name IS NOT NULL THEN
    INSERT INTO public.api_organizations (
      name,
      contact_email,
      contact_name,
      status,
      subscription_tier
    ) VALUES (
      org_name,
      NEW.email,
      COALESCE(contact_name, split_part(NEW.email, '@', 1)),
      'Pending'::status,
      'free'::api_subscription_tier
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Update trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();