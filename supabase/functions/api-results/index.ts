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

    // Extract and validate API key
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
      await supabaseClient.rpc('log_api_usage', {
        p_organization_id: null,
        p_endpoint: req.url,
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
      .select('id, rate_limit_per_minute, organization_id')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (!keyDetails) {
      throw new Error('API key not found');
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const resourceId = pathSegments[pathSegments.length - 1];

    switch (req.method) {
      case 'GET':
        if (resourceId === 'analytics') {
          // Get organization analytics
          const startDate = url.searchParams.get('start_date');
          const endDate = url.searchParams.get('end_date');
          const period = url.searchParams.get('period') || 'daily';

          // Get usage aggregates
          let query = supabaseClient
            .from('api_usage_aggregates')
            .select('*')
            .eq('organization_id', orgId)
            .eq('period_type', period)
            .order('date_period', { ascending: false });

          if (startDate) {
            query = query.gte('date_period', startDate);
          }
          if (endDate) {
            query = query.lte('date_period', endDate);
          }

          const { data: analytics, error: analyticsError } = await query.limit(100);
          if (analyticsError) throw analyticsError;

          // Get quota usage
          const { data: quotaUsage } = await supabaseClient.rpc('check_quota_usage', {
            p_organization_id: orgId,
            p_quota_type: 'assessments',
            p_period_type: 'monthly'
          });

          // Get recent sessions
          const { data: recentSessions } = await supabaseClient
            .from('api_assessment_sessions')
            .select(`
              id,
              created_at,
              started_at,
              completed_at,
              is_active,
              external_user_id,
              api_assessment_templates!inner(name)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .limit(50);

          // Log API usage
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: req.url,
            p_method: req.method,
            p_status_code: 200,
            p_api_key_id: keyDetails.id,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            analytics: analytics || [],
            quota_usage: quotaUsage,
            recent_sessions: recentSessions || [],
            summary: {
              total_sessions: recentSessions?.length || 0,
              active_sessions: recentSessions?.filter(s => s.is_active).length || 0,
              completed_sessions: recentSessions?.filter(s => s.completed_at).length || 0
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else if (resourceId && resourceId !== 'api-results') {
          // Get specific session results
          const sessionId = resourceId;

          // Verify session belongs to organization
          const { data: session, error: sessionError } = await supabaseClient
            .from('api_assessment_sessions')
            .select(`
              *,
              api_users!inner(external_user_id),
              api_assessment_templates!inner(name, config)
            `)
            .eq('id', sessionId)
            .eq('organization_id', orgId)
            .single();

          if (sessionError || !session) {
            throw new Error('Session not found or access denied');
          }

          // Get assessment responses
          const { data: responses } = await supabaseClient
            .from('assessment_responses')
            .select(`
              *,
              assessment_questions!inner(title, type, options)
            `)
            .eq('assessment_id', session.assessment_id)
            .order('created_at');

          // Get career recommendations if assessment is completed
          let recommendations = null;
          if (session.completed_at) {
            const { data: recs } = await supabaseClient
              .from('career_recommendations')
              .select('*')
              .eq('assessment_id', session.assessment_id)
              .order('match_score', { ascending: false });
            recommendations = recs;
          }

          // Log API usage
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: req.url,
            p_method: req.method,
            p_status_code: 200,
            p_api_key_id: keyDetails.id,
            p_session_id: sessionId,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            session: {
              id: session.id,
              external_user_id: session.api_users.external_user_id,
              template_name: session.api_assessment_templates.name,
              started_at: session.started_at,
              completed_at: session.completed_at,
              is_active: session.is_active,
              progress_data: session.progress_data,
              client_metadata: session.client_metadata
            },
            responses: responses || [],
            recommendations: recommendations || [],
            summary: {
              total_responses: responses?.length || 0,
              completion_percentage: session.completed_at ? 100 : 
                Math.round(((responses?.length || 0) / 20) * 100), // Assuming ~20 questions
              estimated_completion_time: session.progress_data?.estimated_completion
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else {
          // Get all sessions for organization
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const offset = parseInt(url.searchParams.get('offset') || '0');
          const status = url.searchParams.get('status'); // active, completed, expired

          let query = supabaseClient
            .from('api_assessment_sessions')
            .select(`
              id,
              created_at,
              started_at,
              completed_at,
              is_active,
              external_user_id,
              client_metadata,
              api_users!inner(external_user_id),
              api_assessment_templates!inner(name)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (status === 'active') {
            query = query.eq('is_active', true).is('completed_at', null);
          } else if (status === 'completed') {
            query = query.not('completed_at', 'is', null);
          } else if (status === 'expired') {
            query = query.eq('is_active', false).is('completed_at', null);
          }

          const { data: sessions, error: sessionsError } = await query;
          if (sessionsError) throw sessionsError;

          // Get total count
          const { count } = await supabaseClient
            .from('api_assessment_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', orgId);

          // Log API usage
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: req.url,
            p_method: req.method,
            p_status_code: 200,
            p_api_key_id: keyDetails.id,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            sessions: sessions || [],
            pagination: {
              total: count || 0,
              limit,
              offset,
              has_more: (count || 0) > offset + limit
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error('Error in api-results function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'RESULTS_API_ERROR'
      }), 
      {
        status: error.message.includes('Invalid API key') ? 401 : 
               error.message.includes('not found') ? 404 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});