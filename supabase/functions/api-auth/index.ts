import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Validate API key and get organization
    const { data: orgId, error: validationError } = await supabaseClient.rpc('validate_api_key', {
      api_key: apiKey
    });

    if (validationError || !orgId) {
      // Log failed attempt
      await supabaseClient.rpc('log_api_usage', {
        p_organization_id: null,
        p_endpoint: '/api/auth/validate',
        p_method: req.method,
        p_status_code: 401,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_error_message: 'Invalid API key'
      });

      throw new Error('Invalid API key');
    }

    // Get API key details for rate limiting
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { data: keyDetails } = await supabaseClient
      .from('api_keys')
      .select('id, rate_limit_per_minute, rate_limit_per_day, organization_id')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (!keyDetails) {
      throw new Error('API key not found');
    }

    // Check rate limits
    const { data: rateLimitResult } = await supabaseClient.rpc('check_rate_limit', {
      p_api_key_id: keyDetails.id,
      p_window_minutes: 1
    });

    if (!rateLimitResult?.allowed) {
      // Log rate limit exceeded
      await supabaseClient.rpc('log_api_usage', {
        p_organization_id: orgId,
        p_endpoint: '/api/auth/validate',
        p_method: req.method,
        p_status_code: 429,
        p_api_key_id: keyDetails.id,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_error_message: 'Rate limit exceeded'
      });

      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          limit: rateLimitResult.limit,
          reset_at: rateLimitResult.reset_at
        }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '60',
            'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
            'X-RateLimit-Reset': rateLimitResult.reset_at || new Date().toISOString()
          },
        }
      );
    }

    // Check quotas
    const { data: quotaResult } = await supabaseClient.rpc('check_quota_usage', {
      p_organization_id: orgId,
      p_quota_type: 'requests',
      p_period_type: 'monthly'
    });

    if (quotaResult && quotaResult.remaining <= 0) {
      // Log quota exceeded
      await supabaseClient.rpc('log_api_usage', {
        p_organization_id: orgId,
        p_endpoint: '/api/auth/validate',
        p_method: req.method,
        p_status_code: 402,
        p_api_key_id: keyDetails.id,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_error_message: 'Quota exceeded'
      });

      return new Response(
        JSON.stringify({ 
          error: 'Monthly quota exceeded',
          code: 'QUOTA_EXCEEDED',
          quota: quotaResult
        }), 
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get organization details
    const { data: organization } = await supabaseClient
      .from('api_organizations')
      .select('id, name, subscription_tier, status')
      .eq('id', orgId)
      .single();

    // Log successful authentication
    await supabaseClient.rpc('log_api_usage', {
      p_organization_id: orgId,
      p_endpoint: '/api/auth/validate',
      p_method: req.method,
      p_status_code: 200,
      p_api_key_id: keyDetails.id,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    });

    console.log('API key validated successfully for organization:', orgId);

    // Return authentication details
    return new Response(JSON.stringify({
      success: true,
      organization: organization,
      rate_limit: {
        limit: rateLimitResult?.limit || keyDetails.rate_limit_per_minute,
        remaining: rateLimitResult?.remaining || keyDetails.rate_limit_per_minute - 1,
        current: rateLimitResult?.current || 1
      },
      quota: quotaResult,
      key_info: {
        id: keyDetails.id,
        environment: keyDetails.environment
      }
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': (rateLimitResult?.limit || keyDetails.rate_limit_per_minute).toString(),
        'X-RateLimit-Remaining': (rateLimitResult?.remaining || keyDetails.rate_limit_per_minute - 1).toString()
      },
    });

  } catch (error) {
    console.error('Error in api-auth function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'AUTH_ERROR'
      }), 
      {
        status: error.message.includes('Invalid API key') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});