-- Add missing database function for API key generation if it doesn't exist
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_part1 TEXT;
  key_part2 TEXT;
  full_key TEXT;
BEGIN
  -- Generate random key parts
  key_part1 := encode(gen_random_bytes(16), 'hex');
  key_part2 := encode(gen_random_bytes(16), 'hex');
  full_key := 'pk_' || key_part1 || key_part2;
  
  RETURN full_key;
END;
$$;

-- Update the RLS policies to ensure proper access control
DROP POLICY IF EXISTS "api_orgs_admin_access" ON api_organizations;
CREATE POLICY "api_orgs_admin_access" ON api_organizations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('admin', 'editor')
  )
);

DROP POLICY IF EXISTS "api_keys_admin_access" ON api_keys;
CREATE POLICY "api_keys_admin_access" ON api_keys
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('admin', 'editor')
  )
);

DROP POLICY IF EXISTS "api_templates_org_access" ON api_assessment_templates;
CREATE POLICY "api_templates_org_access" ON api_assessment_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('admin', 'editor')
  )
);