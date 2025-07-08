-- Phase 1B: Assessment Extensions for Multi-Tenant API

-- Assessment Templates for organizations to define custom assessments
CREATE TABLE api_assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Template configuration
  config JSONB NOT NULL DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  scoring_logic JSONB DEFAULT '{}',
  question_sets JSONB DEFAULT '[]',
  target_audience TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY['en']::TEXT[],
  
  -- Metadata
  estimated_duration_minutes INTEGER DEFAULT 15,
  max_retries INTEGER DEFAULT 3,
  session_timeout_minutes INTEGER DEFAULT 60,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization_id, name, version)
);

-- API Users table for managing users from client systems
CREATE TABLE api_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  
  -- User profile data from client
  profile_data JSONB DEFAULT '{}',
  user_metadata JSONB DEFAULT '{}',
  
  -- Assessment tracking
  assessments_taken INTEGER DEFAULT 0,
  last_assessment_at TIMESTAMPTZ,
  
  -- Status tracking
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique external user per organization
  UNIQUE(organization_id, external_user_id)
);

-- Assessment Sessions for token-based access
CREATE TABLE api_assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  api_user_id UUID NOT NULL REFERENCES api_users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES api_assessment_templates(id),
  
  -- Session management
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Assessment data
  assessment_id UUID REFERENCES career_assessments(id),
  current_question_index INTEGER DEFAULT 0,
  progress_data JSONB DEFAULT '{}',
  
  -- Completion tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Client configuration
  callback_url TEXT,
  webhook_url TEXT,
  return_url TEXT,
  client_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend existing career_assessments table for API integration
ALTER TABLE career_assessments
ADD COLUMN organization_id UUID REFERENCES api_organizations(id),
ADD COLUMN template_id UUID REFERENCES api_assessment_templates(id),
ADD COLUMN external_user_id TEXT,
ADD COLUMN api_session_id UUID REFERENCES api_assessment_sessions(id),
ADD COLUMN callback_url TEXT,
ADD COLUMN webhook_url TEXT,
ADD COLUMN client_metadata JSONB DEFAULT '{}',
ADD COLUMN api_created BOOLEAN DEFAULT false;

-- Extend assessment_questions for organization-specific questions
ALTER TABLE assessment_questions
ADD COLUMN organization_id UUID REFERENCES api_organizations(id),
ADD COLUMN template_id UUID REFERENCES api_assessment_templates(id),
ADD COLUMN is_custom BOOLEAN DEFAULT false,
ADD COLUMN custom_config JSONB DEFAULT '{}';

-- Performance indexes
CREATE INDEX idx_api_assessment_templates_org_active ON api_assessment_templates(organization_id, is_active);
CREATE INDEX idx_api_assessment_templates_default ON api_assessment_templates(organization_id, is_default) WHERE is_default = true;
CREATE INDEX idx_api_users_org_external ON api_users(organization_id, external_user_id);
CREATE INDEX idx_api_users_last_assessment ON api_users(last_assessment_at);
CREATE INDEX idx_api_assessment_sessions_token ON api_assessment_sessions(session_token);
CREATE INDEX idx_api_assessment_sessions_expires ON api_assessment_sessions(expires_at) WHERE is_active = true;
CREATE INDEX idx_api_assessment_sessions_org_user ON api_assessment_sessions(organization_id, api_user_id);
CREATE INDEX idx_career_assessments_org ON career_assessments(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_career_assessments_api_session ON career_assessments(api_session_id) WHERE api_session_id IS NOT NULL;
CREATE INDEX idx_assessment_questions_org ON assessment_questions(organization_id) WHERE organization_id IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE api_assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_assessment_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for API Assessment Templates
CREATE POLICY "api_templates_org_access" ON api_assessment_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM api_organizations 
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('admin', 'editor')
      )
    )
  );

-- RLS Policies for API Users
CREATE POLICY "api_users_org_access" ON api_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM api_organizations 
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('admin', 'editor')
      )
    )
  );

-- RLS Policies for API Assessment Sessions
CREATE POLICY "api_sessions_org_access" ON api_assessment_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM api_organizations 
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('admin', 'editor')
      )
    )
  );

-- Function to generate secure session tokens
CREATE OR REPLACE FUNCTION generate_session_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token_prefix TEXT := 'ast_'; -- API Session Token
  token_body TEXT;
  full_token TEXT;
BEGIN
  -- Generate random token body
  token_body := encode(gen_random_bytes(32), 'base64');
  -- Remove URL-unsafe characters
  token_body := replace(replace(replace(token_body, '+', ''), '/', ''), '=', '');
  -- Create full token
  full_token := token_prefix || token_body;
  
  RETURN full_token;
END;
$$;

-- Function to create assessment session
CREATE OR REPLACE FUNCTION create_assessment_session(
  p_organization_id UUID,
  p_external_user_id TEXT,
  p_template_id UUID DEFAULT NULL,
  p_callback_url TEXT DEFAULT NULL,
  p_webhook_url TEXT DEFAULT NULL,
  p_return_url TEXT DEFAULT NULL,
  p_client_metadata JSONB DEFAULT '{}',
  p_expires_in_minutes INTEGER DEFAULT 60
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_api_user_id UUID;
  v_session_id UUID;
  v_session_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get or create API user
  INSERT INTO api_users (organization_id, external_user_id)
  VALUES (p_organization_id, p_external_user_id)
  ON CONFLICT (organization_id, external_user_id)
  DO UPDATE SET 
    updated_at = NOW(),
    is_active = true
  RETURNING id INTO v_api_user_id;
  
  -- Generate session token and expiration
  v_session_token := generate_session_token();
  v_expires_at := NOW() + (p_expires_in_minutes || ' minutes')::interval;
  
  -- Create session
  INSERT INTO api_assessment_sessions (
    organization_id,
    api_user_id,
    template_id,
    session_token,
    expires_at,
    callback_url,
    webhook_url,
    return_url,
    client_metadata
  ) VALUES (
    p_organization_id,
    v_api_user_id,
    p_template_id,
    v_session_token,
    v_expires_at,
    p_callback_url,
    p_webhook_url,
    p_return_url,
    p_client_metadata
  ) RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;

-- Function to validate session token
CREATE OR REPLACE FUNCTION validate_session_token(p_session_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_session_record RECORD;
BEGIN
  -- Find active session
  SELECT * INTO v_session_record
  FROM api_assessment_sessions
  WHERE session_token = p_session_token
  AND is_active = true
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired session token';
  END IF;
  
  -- Update last activity
  UPDATE api_assessment_sessions 
  SET last_activity_at = NOW() 
  WHERE id = v_session_record.id;
  
  -- Set context for RLS
  PERFORM set_config('app.session_token', p_session_token, true);
  PERFORM set_config('app.organization_id', v_session_record.organization_id::text, true);
  PERFORM set_config('app.api_user_id', v_session_record.api_user_id::text, true);
  
  RETURN v_session_record.id;
END;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Mark expired sessions as inactive
  UPDATE api_assessment_sessions
  SET is_active = false,
      updated_at = NOW()
  WHERE expires_at < NOW()
  AND is_active = true;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_api_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER api_assessment_templates_updated_at
  BEFORE UPDATE ON api_assessment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_api_updated_at();

CREATE TRIGGER api_users_updated_at
  BEFORE UPDATE ON api_users
  FOR EACH ROW
  EXECUTE FUNCTION update_api_updated_at();

CREATE TRIGGER api_assessment_sessions_updated_at
  BEFORE UPDATE ON api_assessment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_api_updated_at();

-- Function to get assessment template for organization
CREATE OR REPLACE FUNCTION get_organization_template(
  p_organization_id UUID,
  p_template_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template_id UUID;
BEGIN
  IF p_template_name IS NOT NULL THEN
    -- Get specific template
    SELECT id INTO v_template_id
    FROM api_assessment_templates
    WHERE organization_id = p_organization_id
    AND name = p_template_name
    AND is_active = true
    ORDER BY version DESC
    LIMIT 1;
  ELSE
    -- Get default template
    SELECT id INTO v_template_id
    FROM api_assessment_templates
    WHERE organization_id = p_organization_id
    AND is_default = true
    AND is_active = true
    ORDER BY version DESC
    LIMIT 1;
  END IF;
  
  RETURN v_template_id;
END;
$$;