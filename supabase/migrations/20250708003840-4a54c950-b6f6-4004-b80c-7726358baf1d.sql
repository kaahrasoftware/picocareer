-- Phase 1A: Foundation Tables & Types for Multi-Tenant API

-- Create API-specific enums
CREATE TYPE api_subscription_tier AS ENUM ('free', 'basic', 'professional', 'enterprise');
CREATE TYPE api_environment AS ENUM ('sandbox', 'production');

-- API Organizations table - Core tenant entity
CREATE TABLE api_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  hub_id UUID REFERENCES hubs(id),
  subscription_tier api_subscription_tier NOT NULL DEFAULT 'free',
  status status NOT NULL DEFAULT 'Pending',
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  billing_address JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys for authentication and authorization
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  environment api_environment NOT NULL DEFAULT 'production',
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 1000,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_org_active ON api_keys(organization_id, is_active);
CREATE INDEX idx_api_organizations_status ON api_organizations(status);
CREATE INDEX idx_api_organizations_tier ON api_organizations(subscription_tier);

-- Enable RLS
ALTER TABLE api_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy for API Organizations
CREATE POLICY "api_orgs_admin_access" ON api_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'editor')
    )
  );

-- RLS Policy for API Keys
CREATE POLICY "api_keys_admin_access" ON api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'editor')
    )
  );

-- Function to validate API key and set context
CREATE OR REPLACE FUNCTION validate_api_key(api_key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
  key_record RECORD;
BEGIN
  -- Hash the provided key and find matching record
  SELECT * INTO key_record
  FROM api_keys
  WHERE key_hash = encode(digest(api_key, 'sha256'), 'hex')
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired API key';
  END IF;
  
  -- Update last_used_at
  UPDATE api_keys 
  SET last_used_at = NOW() 
  WHERE id = key_record.id;
  
  -- Set context for RLS
  PERFORM set_config('app.api_key_hash', key_record.key_hash, true);
  PERFORM set_config('app.organization_id', key_record.organization_id::text, true);
  
  RETURN key_record.organization_id;
END;
$$;

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_organizations_updated_at
  BEFORE UPDATE ON api_organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_api_updated_at();