-- Phase 1C: Usage Tracking & Analytics for Multi-Tenant API (Fixed)

-- Create API usage logs table for tracking all requests
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  session_id UUID REFERENCES api_assessment_sessions(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create API quotas table for managing usage limits
CREATE TABLE api_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  quota_type TEXT NOT NULL, -- 'requests', 'assessments', 'storage'
  limit_value INTEGER NOT NULL,
  period_type TEXT NOT NULL, -- 'daily', 'monthly', 'yearly'
  reset_day INTEGER, -- For monthly/yearly periods
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, quota_type, period_type)
);

-- Create API usage aggregates for efficient querying
CREATE TABLE api_usage_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  date_period DATE NOT NULL,
  period_type TEXT NOT NULL, -- 'daily', 'monthly'
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  total_assessments INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER,
  total_data_transfer_bytes BIGINT DEFAULT 0,
  unique_endpoints INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, date_period, period_type)
);

-- Create billing events table for tracking billable activities
CREATE TABLE api_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'assessment_completed', 'api_request', 'storage_usage'
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,4),
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  reference_id UUID, -- Reference to related record
  metadata JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rate limiting tracking table
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES api_organizations(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  window_duration_minutes INTEGER NOT NULL,
  request_count INTEGER DEFAULT 0,
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_key_id, window_start, window_duration_minutes)
);

-- Performance indexes for usage logs
CREATE INDEX idx_api_usage_logs_org_created ON api_usage_logs(organization_id, created_at DESC);
CREATE INDEX idx_api_usage_logs_session ON api_usage_logs(session_id);
CREATE INDEX idx_api_usage_logs_key_created ON api_usage_logs(api_key_id, created_at DESC);
CREATE INDEX idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX idx_api_usage_logs_status ON api_usage_logs(status_code);

-- Indexes for quotas and aggregates
CREATE INDEX idx_api_quotas_org_active ON api_quotas(organization_id, is_active);
CREATE INDEX idx_api_usage_aggregates_org_period ON api_usage_aggregates(organization_id, date_period, period_type);

-- Indexes for billing and rate limiting
CREATE INDEX idx_api_billing_events_org_created ON api_billing_events(organization_id, created_at DESC);
CREATE INDEX idx_api_billing_events_processed ON api_billing_events(processed, created_at);
CREATE INDEX idx_api_rate_limits_key_window ON api_rate_limits(api_key_id, window_start);

-- Enable RLS on all new tables
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage logs
CREATE POLICY "api_usage_logs_admin_access" ON api_usage_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'editor')
    )
  );

-- RLS policies for quotas
CREATE POLICY "api_quotas_admin_access" ON api_quotas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'editor')
    )
  );

-- RLS policies for usage aggregates
CREATE POLICY "api_usage_aggregates_admin_access" ON api_usage_aggregates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'editor')
    )
  );

-- RLS policies for billing events
CREATE POLICY "api_billing_events_admin_access" ON api_billing_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'editor')
    )
  );

-- RLS policies for rate limits
CREATE POLICY "api_rate_limits_admin_access" ON api_rate_limits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('admin', 'editor')
    )
  );

-- Function to log API usage (fixed parameter order)
CREATE OR REPLACE FUNCTION log_api_usage(
  p_organization_id UUID,
  p_endpoint TEXT,
  p_method TEXT,
  p_status_code INTEGER,
  p_api_key_id UUID DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_request_size_bytes INTEGER DEFAULT NULL,
  p_response_size_bytes INTEGER DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO api_usage_logs (
    organization_id,
    api_key_id,
    session_id,
    endpoint,
    method,
    status_code,
    response_time_ms,
    request_size_bytes,
    response_size_bytes,
    ip_address,
    user_agent,
    error_message,
    metadata
  ) VALUES (
    p_organization_id,
    p_api_key_id,
    p_session_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_time_ms,
    p_request_size_bytes,
    p_response_size_bytes,
    p_ip_address,
    p_user_agent,
    p_error_message,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_api_key_id UUID,
  p_window_minutes INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id UUID;
  v_current_window TIMESTAMPTZ;
  v_request_count INTEGER;
  v_rate_limit INTEGER;
  v_result JSONB;
BEGIN
  -- Get organization and rate limit for the API key
  SELECT organization_id, rate_limit_per_minute INTO v_organization_id, v_rate_limit
  FROM api_keys
  WHERE id = p_api_key_id AND is_active = true;
  
  IF v_organization_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Invalid API key');
  END IF;
  
  -- Calculate current window start
  v_current_window := date_trunc('minute', NOW()) - ((EXTRACT(MINUTE FROM NOW())::INTEGER % p_window_minutes) * INTERVAL '1 minute');
  
  -- Get or create rate limit record
  INSERT INTO api_rate_limits (
    organization_id,
    api_key_id,
    window_start,
    window_duration_minutes,
    request_count
  ) VALUES (
    v_organization_id,
    p_api_key_id,
    v_current_window,
    p_window_minutes,
    1
  )
  ON CONFLICT (api_key_id, window_start, window_duration_minutes)
  DO UPDATE SET 
    request_count = api_rate_limits.request_count + 1,
    last_request_at = NOW()
  RETURNING request_count INTO v_request_count;
  
  -- Check if rate limit exceeded
  IF v_request_count > v_rate_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Rate limit exceeded',
      'limit', v_rate_limit,
      'current', v_request_count,
      'reset_at', v_current_window + (p_window_minutes * INTERVAL '1 minute')
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'limit', v_rate_limit,
    'current', v_request_count,
    'remaining', v_rate_limit - v_request_count
  );
END;
$$;

-- Function to check quota usage
CREATE OR REPLACE FUNCTION check_quota_usage(
  p_organization_id UUID,
  p_quota_type TEXT,
  p_period_type TEXT DEFAULT 'monthly'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quota_limit INTEGER;
  v_current_usage INTEGER;
  v_period_start DATE;
  v_result JSONB;
BEGIN
  -- Get quota limit
  SELECT limit_value INTO v_quota_limit
  FROM api_quotas
  WHERE organization_id = p_organization_id
  AND quota_type = p_quota_type
  AND period_type = p_period_type
  AND is_active = true;
  
  IF v_quota_limit IS NULL THEN
    RETURN jsonb_build_object('error', 'No quota defined for this type and period');
  END IF;
  
  -- Calculate period start
  IF p_period_type = 'monthly' THEN
    v_period_start := date_trunc('month', CURRENT_DATE);
  ELSIF p_period_type = 'daily' THEN
    v_period_start := CURRENT_DATE;
  ELSE
    v_period_start := date_trunc('year', CURRENT_DATE);
  END IF;
  
  -- Get current usage from aggregates
  SELECT COALESCE(
    CASE 
      WHEN p_quota_type = 'requests' THEN total_requests
      WHEN p_quota_type = 'assessments' THEN total_assessments
      ELSE 0
    END, 0
  ) INTO v_current_usage
  FROM api_usage_aggregates
  WHERE organization_id = p_organization_id
  AND date_period = v_period_start
  AND period_type = p_period_type;
  
  RETURN jsonb_build_object(
    'quota_type', p_quota_type,
    'period_type', p_period_type,
    'limit', v_quota_limit,
    'used', COALESCE(v_current_usage, 0),
    'remaining', v_quota_limit - COALESCE(v_current_usage, 0),
    'period_start', v_period_start
  );
END;
$$;

-- Function to update usage aggregates
CREATE OR REPLACE FUNCTION update_usage_aggregates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_daily_period DATE;
  v_monthly_period DATE;
BEGIN
  v_daily_period := DATE(NEW.created_at);
  v_monthly_period := date_trunc('month', NEW.created_at)::DATE;
  
  -- Update daily aggregates
  INSERT INTO api_usage_aggregates (
    organization_id,
    date_period,
    period_type,
    total_requests,
    successful_requests,
    failed_requests,
    total_assessments,
    avg_response_time_ms,
    total_data_transfer_bytes
  ) VALUES (
    NEW.organization_id,
    v_daily_period,
    'daily',
    1,
    CASE WHEN NEW.status_code < 400 THEN 1 ELSE 0 END,
    CASE WHEN NEW.status_code >= 400 THEN 1 ELSE 0 END,
    CASE WHEN NEW.endpoint LIKE '%assessment%' AND NEW.status_code < 400 THEN 1 ELSE 0 END,
    COALESCE(NEW.response_time_ms, 0),
    COALESCE(NEW.request_size_bytes, 0) + COALESCE(NEW.response_size_bytes, 0)
  )
  ON CONFLICT (organization_id, date_period, period_type)
  DO UPDATE SET
    total_requests = api_usage_aggregates.total_requests + 1,
    successful_requests = api_usage_aggregates.successful_requests + 
      CASE WHEN NEW.status_code < 400 THEN 1 ELSE 0 END,
    failed_requests = api_usage_aggregates.failed_requests + 
      CASE WHEN NEW.status_code >= 400 THEN 1 ELSE 0 END,
    total_assessments = api_usage_aggregates.total_assessments +
      CASE WHEN NEW.endpoint LIKE '%assessment%' AND NEW.status_code < 400 THEN 1 ELSE 0 END,
    avg_response_time_ms = (
      (api_usage_aggregates.avg_response_time_ms * api_usage_aggregates.total_requests + COALESCE(NEW.response_time_ms, 0))
      / (api_usage_aggregates.total_requests + 1)
    ),
    total_data_transfer_bytes = api_usage_aggregates.total_data_transfer_bytes + 
      COALESCE(NEW.request_size_bytes, 0) + COALESCE(NEW.response_size_bytes, 0),
    updated_at = NOW();
  
  -- Update monthly aggregates
  INSERT INTO api_usage_aggregates (
    organization_id,
    date_period,
    period_type,
    total_requests,
    successful_requests,
    failed_requests,
    total_assessments,
    avg_response_time_ms,
    total_data_transfer_bytes
  ) VALUES (
    NEW.organization_id,
    v_monthly_period,
    'monthly',
    1,
    CASE WHEN NEW.status_code < 400 THEN 1 ELSE 0 END,
    CASE WHEN NEW.status_code >= 400 THEN 1 ELSE 0 END,
    CASE WHEN NEW.endpoint LIKE '%assessment%' AND NEW.status_code < 400 THEN 1 ELSE 0 END,
    COALESCE(NEW.response_time_ms, 0),
    COALESCE(NEW.request_size_bytes, 0) + COALESCE(NEW.response_size_bytes, 0)
  )
  ON CONFLICT (organization_id, date_period, period_type)
  DO UPDATE SET
    total_requests = api_usage_aggregates.total_requests + 1,
    successful_requests = api_usage_aggregates.successful_requests + 
      CASE WHEN NEW.status_code < 400 THEN 1 ELSE 0 END,
    failed_requests = api_usage_aggregates.failed_requests + 
      CASE WHEN NEW.status_code >= 400 THEN 1 ELSE 0 END,
    total_assessments = api_usage_aggregates.total_assessments +
      CASE WHEN NEW.endpoint LIKE '%assessment%' AND NEW.status_code < 400 THEN 1 ELSE 0 END,
    avg_response_time_ms = (
      (api_usage_aggregates.avg_response_time_ms * api_usage_aggregates.total_requests + COALESCE(NEW.response_time_ms, 0))
      / (api_usage_aggregates.total_requests + 1)
    ),
    total_data_transfer_bytes = api_usage_aggregates.total_data_transfer_bytes + 
      COALESCE(NEW.request_size_bytes, 0) + COALESCE(NEW.response_size_bytes, 0),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic usage aggregation
CREATE TRIGGER update_usage_aggregates_trigger
  AFTER INSERT ON api_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_aggregates();

-- Function to create billing event (fixed parameter order)
CREATE OR REPLACE FUNCTION create_billing_event(
  p_organization_id UUID,
  p_event_type TEXT,
  p_quantity INTEGER DEFAULT 1,
  p_unit_price DECIMAL DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_total_amount DECIMAL;
BEGIN
  -- Calculate total if unit price provided
  IF p_unit_price IS NOT NULL THEN
    v_total_amount := p_quantity * p_unit_price;
  END IF;
  
  INSERT INTO api_billing_events (
    organization_id,
    event_type,
    quantity,
    unit_price,
    total_amount,
    reference_id,
    metadata
  ) VALUES (
    p_organization_id,
    p_event_type,
    p_quantity,
    p_unit_price,
    v_total_amount,
    p_reference_id,
    p_metadata
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Add triggers to update updated_at columns
CREATE TRIGGER api_quotas_updated_at
  BEFORE UPDATE ON api_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_api_updated_at();

CREATE TRIGGER api_usage_aggregates_updated_at
  BEFORE UPDATE ON api_usage_aggregates
  FOR EACH ROW
  EXECUTE FUNCTION update_api_updated_at();