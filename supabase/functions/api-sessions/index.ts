import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSessionRequest {
  external_user_id: string;
  template_id?: string;
  template_name?: string;
  callback_url?: string;
  webhook_url?: string;
  return_url?: string;
  client_metadata?: object;
  expires_in_minutes?: number;
}

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
    const startTime = Date.now();

    // Validate API key and get organization
    const { data: orgId, error: validationError } = await supabaseClient.rpc('validate_api_key', {
      api_key: apiKey
    });

    if (validationError || !orgId) {
      throw new Error('Invalid API key');
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const sessionId = pathSegments[pathSegments.length - 1];

    switch (req.method) {
      case 'POST':
        const createData: CreateSessionRequest = await req.json();
        
        // Get template ID if template_name provided
        let templateId = createData.template_id;
        if (!templateId && createData.template_name) {
          const { data: foundTemplateId } = await supabaseClient.rpc('get_organization_template', {
            p_organization_id: orgId,
            p_template_name: createData.template_name
          });
          templateId = foundTemplateId;
        } else if (!templateId) {
          // Get default template
          const { data: defaultTemplateId } = await supabaseClient.rpc('get_organization_template', {
            p_organization_id: orgId,
            p_template_name: null
          });
          templateId = defaultTemplateId;
        }

        if (!templateId) {
          throw new Error('No assessment template found for organization');
        }

        // Create assessment session
        const { data: sessionIdResult, error: sessionError } = await supabaseClient.rpc('create_assessment_session', {
          p_organization_id: orgId,
          p_external_user_id: createData.external_user_id,
          p_template_id: templateId,
          p_callback_url: createData.callback_url,
          p_webhook_url: createData.webhook_url,
          p_return_url: createData.return_url,
          p_client_metadata: createData.client_metadata || {},
          p_expires_in_minutes: createData.expires_in_minutes || 60
        });

        if (sessionError || !sessionIdResult) {
          throw new Error('Failed to create assessment session');
        }

        // Get session details
        const { data: session, error: fetchError } = await supabaseClient
          .from('api_assessment_sessions')
          .select(`
            id,
            session_token,
            expires_at,
            organization_id,
            api_user_id,
            template_id,
            callback_url,
            webhook_url,
            return_url,
            client_metadata,
            created_at
          `)
          .eq('id', sessionIdResult)
          .single();

        if (fetchError || !session) {
          throw new Error('Failed to fetch created session');
        }

        // Log successful session creation
        await supabaseClient.rpc('log_api_usage', {
          p_organization_id: orgId,
          p_endpoint: '/api/sessions',
          p_method: 'POST',
          p_status_code: 201,
          p_session_id: session.id,
          p_response_time_ms: Date.now() - startTime,
          p_ip_address: ipAddress,
          p_user_agent: userAgent
        });

        console.log('Created assessment session:', session.id, 'for organization:', orgId);

        return new Response(JSON.stringify({
          session_id: session.id,
          session_token: session.session_token,
          assessment_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/assessment/${session.session_token}`,
          expires_at: session.expires_at,
          template_id: session.template_id,
          external_user_id: createData.external_user_id
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'GET':
        if (sessionId && sessionId !== 'api-sessions') {
          // Get single session
          const { data: session, error } = await supabaseClient
            .from('api_assessment_sessions')
            .select(`
              id,
              organization_id,
              session_token,
              expires_at,
              is_active,
              started_at,
              completed_at,
              current_question_index,
              progress_data,
              client_metadata,
              created_at,
              last_activity_at,
              api_users!inner(external_user_id)
            `)
            .eq('id', sessionId)
            .eq('organization_id', orgId)
            .single();

          if (error) throw error;

          // Log successful session fetch
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: `/api/sessions/${sessionId}`,
            p_method: 'GET',
            p_status_code: 200,
            p_session_id: session.id,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify(session), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all sessions for organization
          const { data: sessions, error } = await supabaseClient
            .from('api_assessment_sessions')
            .select(`
              id,
              session_token,
              expires_at,
              is_active,
              started_at,
              completed_at,
              current_question_index,
              created_at,
              last_activity_at,
              api_users!inner(external_user_id)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Log successful sessions fetch
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: '/api/sessions',
            p_method: 'GET',
            p_status_code: 200,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify(sessions), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error('Error in api-sessions function:', error);
    
    const statusCode = error.message.includes('Invalid API key') ? 401 : 
                      error.message.includes('template') ? 404 : 400;

    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'SESSION_API_ERROR'
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});