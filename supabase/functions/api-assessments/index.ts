import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSessionRequest {
  external_user_id: string;
  template_name?: string;
  callback_url?: string;
  webhook_url?: string;
  return_url?: string;
  client_metadata?: object;
  expires_in_minutes?: number;
}

interface SubmitResponseRequest {
  question_id: string;
  answer: any;
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

    // Rate limiting check
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

    // Check rate limits
    const { data: rateLimitResult } = await supabaseClient.rpc('check_rate_limit', {
      p_api_key_id: keyDetails.id,
      p_window_minutes: 1
    });

    if (!rateLimitResult?.allowed) {
      await supabaseClient.rpc('log_api_usage', {
        p_organization_id: orgId,
        p_endpoint: req.url,
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
          reset_at: rateLimitResult.reset_at
        }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset_at || new Date().toISOString()
          },
        }
      );
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const sessionToken = pathSegments[pathSegments.length - 1];

    switch (req.method) {
      case 'POST':
        if (sessionToken && sessionToken !== 'api-assessments') {
          // Submit response to existing session
          let responseData: SubmitResponseRequest;
          try {
            responseData = await req.json();
          } catch (error) {
            throw new Error('Invalid JSON in request body');
          }

          // Validate session token
          const sessionId = await supabaseClient.rpc('validate_session_token', {
            p_session_token: sessionToken
          });

          // Get session details
          const { data: session } = await supabaseClient
            .from('api_assessment_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (!session) {
            throw new Error('Session not found');
          }

          // Validate question belongs to session template
          const { data: question } = await supabaseClient
            .from('assessment_questions')
            .select('*')
            .eq('id', responseData.question_id)
            .eq('template_id', session.template_id)
            .single();

          if (!question) {
            throw new Error('Invalid question for this session');
          }

          // Save response
          const { data: response, error: responseError } = await supabaseClient
            .from('assessment_responses')
            .insert({
              assessment_id: session.assessment_id,
              question_id: responseData.question_id,
              answer: responseData.answer
            })
            .select()
            .single();

          if (responseError) throw responseError;

          // Update session progress
          const currentIndex = session.current_question_index || 0;
          await supabaseClient
            .from('api_assessment_sessions')
            .update({
              current_question_index: currentIndex + 1,
              progress_data: {
                ...session.progress_data,
                responses_count: (session.progress_data?.responses_count || 0) + 1,
                last_response_at: new Date().toISOString()
              }
            })
            .eq('id', sessionId);

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
            success: true,
            response_id: response.id,
            next_question_index: currentIndex + 1
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else {
          // Create new assessment session
          let createData: CreateSessionRequest;
          try {
            createData = await req.json();
          } catch (error) {
            throw new Error('Invalid JSON in request body');
          }

          if (!createData.external_user_id) {
            throw new Error('external_user_id is required');
          }

          // Get template
          const templateId = await supabaseClient.rpc('get_organization_template', {
            p_organization_id: orgId,
            p_template_name: createData.template_name
          });

          if (!templateId) {
            throw new Error('No template found for organization');
          }

          // Create assessment session
          const sessionId = await supabaseClient.rpc('create_assessment_session', {
            p_organization_id: orgId,
            p_external_user_id: createData.external_user_id,
            p_template_id: templateId,
            p_callback_url: createData.callback_url,
            p_webhook_url: createData.webhook_url,
            p_return_url: createData.return_url,
            p_client_metadata: createData.client_metadata || {},
            p_expires_in_minutes: createData.expires_in_minutes || 60
          });

          // Get session details with token
          const { data: session } = await supabaseClient
            .from('api_assessment_sessions')
            .select('session_token, expires_at')
            .eq('id', sessionId)
            .single();

          // Get first questions
          const { data: questions } = await supabaseClient
            .from('assessment_questions')
            .select('*')
            .eq('template_id', templateId)
            .eq('is_active', true)
            .order('order_index')
            .limit(5);

          // Log API usage
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: req.url,
            p_method: req.method,
            p_status_code: 201,
            p_api_key_id: keyDetails.id,
            p_session_id: sessionId,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            session_id: sessionId,
            session_token: session.session_token,
            expires_at: session.expires_at,
            questions: questions || [],
            total_questions: questions?.length || 0
          }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'GET':
        if (!sessionToken || sessionToken === 'api-assessments') {
          throw new Error('Session token required');
        }

        // Get session status and next questions
        const sessionId = await supabaseClient.rpc('validate_session_token', {
          p_session_token: sessionToken
        });

        const { data: session } = await supabaseClient
          .from('api_assessment_sessions')
          .select(`
            *,
            api_assessment_templates!inner(name, question_sets)
          `)
          .eq('id', sessionId)
          .single();

        if (!session) {
          throw new Error('Session not found');
        }

        // Get next questions based on current progress
        const currentIndex = session.current_question_index || 0;
        const { data: nextQuestions } = await supabaseClient
          .from('assessment_questions')
          .select('*')
          .eq('template_id', session.template_id)
          .eq('is_active', true)
          .order('order_index')
          .range(currentIndex, currentIndex + 4);

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
          session_id: sessionId,
          status: session.is_active ? 'active' : 'expired',
          current_question_index: currentIndex,
          questions: nextQuestions || [],
          progress: {
            responses_count: session.progress_data?.responses_count || 0,
            estimated_completion: session.progress_data?.estimated_completion,
            last_activity: session.last_activity_at
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error('Error in api-assessments function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'ASSESSMENT_API_ERROR'
      }), 
      {
        status: error.message.includes('Rate limit') ? 429 : 
               error.message.includes('Invalid API key') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});